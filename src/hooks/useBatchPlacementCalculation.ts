
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CampoModelo } from '@/types/dynamicScoring';

interface AthleteScore {
  athleteId: string;
  athleteName: string;
  score: number;
  placement?: number;
}

interface UseBatchPlacementCalculationProps {
  modalityId: number;
  eventId: string;
  judgeId: string;
  modeloId: number;
  bateriaId?: number;
}

export function useBatchPlacementCalculation({
  modalityId,
  eventId,
  judgeId,
  modeloId,
  bateriaId
}: UseBatchPlacementCalculationProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const queryClient = useQueryClient();

  const calculateBatchPlacements = async (
    calculatedField: CampoModelo, 
    athleteScores: Record<string, any>
  ) => {
    setIsCalculating(true);
    
    try {
      console.log('Iniciando cálculo de colocações para campo:', calculatedField.chave_campo);
      console.log('Dados dos atletas recebidos:', athleteScores);
      
      let referenceField = calculatedField.metadados?.campo_referencia;
      console.log('Campo de referência configurado:', referenceField);
      
      // Se não há campo de referência configurado, tentar encontrar um campo numérico
      if (!referenceField) {
        console.log('Campo de referência não configurado, buscando campo numérico...');
        
        // Pegar o primeiro atleta para ver quais campos estão disponíveis
        const firstAthleteData = Object.values(athleteScores)[0];
        if (firstAthleteData) {
          const availableFields = Object.keys(firstAthleteData).filter(key => 
            key !== 'athleteName' && 
            !isNaN(parseFloat(firstAthleteData[key])) &&
            firstAthleteData[key] !== '' &&
            firstAthleteData[key] !== null &&
            firstAthleteData[key] !== undefined
          );
          
          console.log('Campos numéricos disponíveis:', availableFields);
          
          if (availableFields.length > 0) {
            referenceField = availableFields[0];
            console.log('Usando campo de referência automático:', referenceField);
          }
        }
      }
      
      if (!referenceField) {
        throw new Error('Nenhum campo de referência disponível para cálculo de colocação. Configure um campo de referência no campo calculado ou insira pontuações numéricas.');
      }

      // Extrair pontuações dos atletas para o campo de referência
      const scores: AthleteScore[] = Object.entries(athleteScores)
        .map(([athleteId, data]) => {
          const score = parseFloat(data[referenceField]) || 0;
          console.log(`Atleta ${data.athleteName || athleteId}: ${referenceField} = ${score}`);
          return {
            athleteId,
            athleteName: data.athleteName || athleteId,
            score
          };
        })
        .filter(item => !isNaN(item.score) && item.score > 0);

      console.log('Pontuações válidas encontradas:', scores.length);

      if (scores.length === 0) {
        throw new Error(`Nenhuma pontuação válida encontrada no campo "${referenceField}". Insira pontuações numéricas maiores que zero para calcular colocações.`);
      }

      // Ordenar baseado no tipo de ordenação configurado
      const ordem = calculatedField.metadados?.ordem_calculo || 'desc';
      console.log('Ordem de cálculo:', ordem);
      
      scores.sort((a, b) => {
        if (ordem === 'asc') {
          return a.score - b.score; // Menor pontuação = melhor colocação
        } else {
          return b.score - a.score; // Maior pontuação = melhor colocação
        }
      });

      // Atribuir colocações (tratando empates)
      let currentPlacement = 1;
      for (let i = 0; i < scores.length; i++) {
        if (i > 0 && scores[i].score !== scores[i - 1].score) {
          currentPlacement = i + 1;
        }
        scores[i].placement = currentPlacement;
        console.log(`${scores[i].athleteName}: ${scores[i].score} pontos = ${currentPlacement}º lugar`);
      }

      // Salvar colocações no banco de dados em lote
      console.log('Salvando colocações no banco de dados...');
      const placementPromises = scores.map(athlete => 
        saveCalculatedPlacement({
          athleteId: athlete.athleteId,
          fieldKey: calculatedField.chave_campo,
          placement: athlete.placement!,
          bateriaId
        })
      );

      await Promise.all(placementPromises);

      // Invalidar queries para recarregar dados
      queryClient.invalidateQueries({
        queryKey: ['athlete-dynamic-scores', modalityId, eventId, modeloId, bateriaId]
      });

      toast.success(`Colocações calculadas para ${scores.length} atletas com base no campo "${referenceField}"`);
      
    } catch (error) {
      console.error('Erro ao calcular colocações:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao calcular colocações');
    } finally {
      setIsCalculating(false);
    }
  };

  const saveCalculatedPlacement = async ({
    athleteId,
    fieldKey,
    placement,
    bateriaId
  }: {
    athleteId: string;
    fieldKey: string;
    placement: number;
    bateriaId?: number;
  }) => {
    console.log(`Salvando colocação para atleta ${athleteId}: ${fieldKey} = ${placement}`);
    
    // Buscar pontuação existente
    let query = supabase
      .from('pontuacoes')
      .select('id')
      .eq('atleta_id', athleteId)
      .eq('modalidade_id', modalityId)
      .eq('evento_id', eventId)
      .eq('modelo_id', modeloId)
      .eq('juiz_id', judgeId);

    if (bateriaId) {
      query = query.eq('numero_bateria', bateriaId);
    } else {
      query = query.is('numero_bateria', null);
    }

    const { data: existingScore, error: scoreError } = await query.single();

    if (scoreError && scoreError.code !== 'PGRST116') {
      throw scoreError;
    }

    let pontuacaoId: number;

    if (existingScore) {
      pontuacaoId = existingScore.id;
    } else {
      // Criar nova pontuação se não existir
      const { data: newScore, error: newScoreError } = await supabase
        .from('pontuacoes')
        .insert({
          atleta_id: athleteId,
          modalidade_id: modalityId,
          evento_id: eventId,
          modelo_id: modeloId,
          juiz_id: judgeId,
          numero_bateria: bateriaId || null
        })
        .select('id')
        .single();

      if (newScoreError) throw newScoreError;
      pontuacaoId = newScore.id;
    }

    // Salvar/atualizar tentativa calculada
    const { error: tentativaError } = await supabase
      .from('tentativas_pontuacao')
      .upsert({
        pontuacao_id: pontuacaoId,
        chave_campo: fieldKey,
        valor: placement,
        valor_formatado: placement.toString(),
        calculado: true
      }, {
        onConflict: 'pontuacao_id,chave_campo'
      });

    if (tentativaError) throw tentativaError;
  };

  return {
    isCalculating,
    calculateBatchPlacements
  };
}
