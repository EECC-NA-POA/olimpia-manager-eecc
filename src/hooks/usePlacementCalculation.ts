
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

interface UsePlacementCalculationProps {
  modalityId: number;
  eventId: string;
  judgeId: string;
  modeloId: number;
  bateriaId?: number;
}

export function usePlacementCalculation({
  modalityId,
  eventId,
  judgeId,
  modeloId,
  bateriaId
}: UsePlacementCalculationProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [needsRecalculation, setNeedsRecalculation] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const calculatePlacements = async (campo: CampoModelo, athleteScores: Record<string, any>) => {
    setIsCalculating(true);
    
    try {
      const referenceField = campo.metadados?.campo_referencia;
      if (!referenceField) {
        throw new Error('Campo de referência não configurado para cálculo de colocação');
      }

      // Extrair pontuações dos atletas para o campo de referência
      const scores: AthleteScore[] = Object.entries(athleteScores)
        .map(([athleteId, data]) => ({
          athleteId,
          athleteName: data.athleteName || athleteId,
          score: parseFloat(data[referenceField]) || 0
        }))
        .filter(item => !isNaN(item.score) && item.score > 0);

      if (scores.length === 0) {
        toast.error('Nenhuma pontuação válida encontrada para calcular colocações');
        return;
      }

      // Ordenar baseado no tipo de ordenação configurado
      const ordem = campo.metadados?.ordem_calculo || 'desc';
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
      }

      // Salvar colocações no banco de dados
      for (const athlete of scores) {
        await saveCalculatedPlacement({
          athleteId: athlete.athleteId,
          fieldKey: campo.chave_campo,
          placement: athlete.placement!,
          bateriaId
        });
      }

      // Marcar que este campo não precisa mais de recálculo
      setNeedsRecalculation(prev => {
        const newSet = new Set(prev);
        newSet.delete(campo.chave_campo);
        return newSet;
      });

      // Invalidar queries para recarregar dados
      queryClient.invalidateQueries({
        queryKey: ['athlete-dynamic-scores', modalityId, eventId, modeloId, bateriaId]
      });

      toast.success(`Colocações calculadas para ${scores.length} atletas`);
      
    } catch (error) {
      console.error('Erro ao calcular colocações:', error);
      toast.error('Erro ao calcular colocações');
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

  const markNeedsRecalculation = (fieldKey: string) => {
    setNeedsRecalculation(prev => new Set(prev).add(fieldKey));
  };

  return {
    isCalculating,
    needsRecalculation,
    calculatePlacements,
    markNeedsRecalculation
  };
}
