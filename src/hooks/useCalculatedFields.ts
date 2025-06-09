
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CampoModelo, CalculationResult, CalculationContext } from '@/types/dynamicScoring';
import { useCamposModelo } from './useDynamicScoring';

interface UseCalculatedFieldsProps {
  modeloId: number;
  modalityId: number;
  eventId: string;
  bateriaId?: number;
}

export function useCalculatedFields({
  modeloId,
  modalityId,
  eventId,
  bateriaId
}: UseCalculatedFieldsProps) {
  const queryClient = useQueryClient();
  const [isCalculating, setIsCalculating] = useState(false);
  
  const { data: allFields = [] } = useCamposModelo(modeloId);
  
  // Filtrar apenas campos calculados
  const calculatedFields = allFields.filter(campo => campo.tipo_input === 'calculated');

  // Buscar pontuações existentes para verificar quais campos podem ser calculados
  const { data: existingScores = [] } = useQuery({
    queryKey: ['calculated-fields-scores', modalityId, eventId, bateriaId],
    queryFn: async () => {
      let query = supabase
        .from('pontuacoes')
        .select(`
          *,
          tentativas_pontuacao (
            chave_campo,
            valor,
            calculado
          )
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('modelo_id', modeloId);

      if (bateriaId) {
        query = query.eq('bateria_id', bateriaId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!eventId && !!modeloId
  });

  // Verificar se um campo pode ser calculado
  const canCalculate = (campo: CampoModelo): boolean => {
    if (!campo.metadados?.campo_referencia) return false;

    // Verificar se existem dados suficientes no campo de referência
    const scoresWithReferenceField = existingScores.filter(score => 
      score.tentativas_pontuacao?.some(
        (tentativa: any) => tentativa.chave_campo === campo.metadados?.campo_referencia
      )
    );

    return scoresWithReferenceField.length > 1; // Precisa de pelo menos 2 atletas para calcular colocação
  };

  // Função para calcular colocação
  const calculatePlacement = async (campo: CampoModelo): Promise<CalculationResult[]> => {
    const referenceField = campo.metadados?.campo_referencia;
    const ordemCalculo = campo.metadados?.ordem_calculo || 'asc';
    
    if (!referenceField) {
      throw new Error('Campo de referência não definido');
    }

    // Buscar todos os valores do campo de referência
    const scoresWithReference = existingScores
      .map(score => {
        const tentativa = score.tentativas_pontuacao?.find(
          (t: any) => t.chave_campo === referenceField
        );
        return tentativa ? {
          atleta_id: score.atleta_id,
          valor: tentativa.valor,
          bateria_id: score.bateria_id
        } : null;
      })
      .filter(Boolean)
      .filter(item => item !== null);

    if (scoresWithReference.length === 0) {
      throw new Error('Nenhum dado encontrado para calcular colocação');
    }

    // Ordenar baseado na ordem de cálculo
    const sortedScores = [...scoresWithReference].sort((a, b) => {
      if (ordemCalculo === 'asc') {
        return a!.valor - b!.valor; // Menor valor = melhor posição
      } else {
        return b!.valor - a!.valor; // Maior valor = melhor posição
      }
    });

    // Calcular colocações (considerando empates)
    const results: CalculationResult[] = [];
    let currentPosition = 1;
    let previousValue: number | null = null;

    sortedScores.forEach((score, index) => {
      if (score && (previousValue === null || score.valor !== previousValue)) {
        currentPosition = index + 1;
      }
      
      if (score) {
        results.push({
          chave_campo: campo.chave_campo,
          atleta_id: score.atleta_id,
          valor_calculado: currentPosition,
          metodo_calculo: `${campo.metadados?.tipo_calculo}_${ordemCalculo}`
        });
        
        previousValue = score.valor;
      }
    });

    return results;
  };

  // Mutation para salvar resultados calculados
  const saveCalculationMutation = useMutation({
    mutationFn: async (results: CalculationResult[]) => {
      console.log('Saving calculation results:', results);

      for (const result of results) {
        // Buscar a pontuação existente do atleta
        const existingScore = existingScores.find(s => s.atleta_id === result.atleta_id);
        
        if (!existingScore) {
          console.warn(`No existing score found for athlete ${result.atleta_id}`);
          continue;
        }

        // Verificar se já existe uma tentativa para este campo
        const existingTentativa = existingScore.tentativas_pontuacao?.find(
          (t: any) => t.chave_campo === result.chave_campo
        );

        if (existingTentativa) {
          // Atualizar tentativa existente
          const { error } = await supabase
            .from('tentativas_pontuacao')
            .update({
              valor: result.valor_calculado,
              calculado: true
            })
            .eq('id', existingTentativa.id);

          if (error) throw error;
        } else {
          // Criar nova tentativa
          const { error } = await supabase
            .from('tentativas_pontuacao')
            .insert({
              pontuacao_id: existingScore.id,
              chave_campo: result.chave_campo,
              valor: result.valor_calculado,
              calculado: true
            });

          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculated-fields-scores'] });
      queryClient.invalidateQueries({ queryKey: ['dynamic-scores'] });
      toast.success('Cálculos salvos com sucesso!');
    },
    onError: (error) => {
      console.error('Error saving calculations:', error);
      toast.error('Erro ao salvar cálculos');
    }
  });

  const calculateField = async (campo: CampoModelo): Promise<CalculationResult[]> => {
    setIsCalculating(true);
    try {
      switch (campo.metadados?.tipo_calculo) {
        case 'colocacao_bateria':
        case 'colocacao_final':
          return await calculatePlacement(campo);
        default:
          throw new Error('Tipo de cálculo não suportado');
      }
    } finally {
      setIsCalculating(false);
    }
  };

  const confirmCalculation = async (results: CalculationResult[]) => {
    await saveCalculationMutation.mutateAsync(results);
  };

  return {
    calculatedFields,
    canCalculate,
    calculateField,
    confirmCalculation,
    isCalculating: isCalculating || saveCalculationMutation.isPending
  };
}
