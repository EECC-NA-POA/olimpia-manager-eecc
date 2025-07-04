
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CampoModelo } from '@/types/dynamicScoring';
import { detectReferenceField } from '@/utils/placement/fieldDetection';
import { extractAthleteScores } from '@/utils/placement/scoreProcessing';
import { calculatePlacements } from '@/utils/placement/placementCalculation';
import { saveCalculatedPlacement } from '@/utils/placement/databaseOperations';

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
      console.log('=== INICIANDO CÁLCULO DE COLOCAÇÕES EM LOTE ===');
      console.log('Campo calculado:', calculatedField.chave_campo);
      console.log('Dados dos atletas recebidos:', Object.keys(athleteScores).length, 'atletas');
      
      // Detectar campo de referência
      const referenceField = detectReferenceField(
        athleteScores, 
        calculatedField.metadados?.campo_referencia
      );
      
      if (!referenceField) {
        throw new Error('Nenhum campo de referência disponível para cálculo de colocação. Configure um campo de referência no campo calculado ou insira pontuações válidas.');
      }

      console.log('Campo de referência detectado:', referenceField);

      // Extrair pontuações dos atletas
      const scores = extractAthleteScores(athleteScores, referenceField);

      console.log('Pontuações válidas encontradas:', scores.length);

      if (scores.length === 0) {
        throw new Error(`Nenhuma pontuação válida encontrada no campo "${referenceField}". Insira pontuações válidas (números ou tempos no formato MM:SS.mmm) para calcular colocações.`);
      }

      // Calcular colocações
      const scoredAthletes = calculatePlacements(scores, calculatedField);

      // Salvar colocações no banco de dados em lote
      console.log('Salvando colocações no banco de dados...');
      const placementPromises = scoredAthletes.map(athlete => 
        saveCalculatedPlacement({
          athleteId: athlete.athleteId,
          fieldKey: calculatedField.chave_campo,
          placement: athlete.placement!,
          modalityId,
          eventId,
          judgeId,
          modeloId,
          bateriaId
        })
      );

      await Promise.all(placementPromises);

      // Query key correta - DEVE ser exatamente igual à usada pela tabela
      const athleteScoresQueryKey = ['athlete-dynamic-scores', modalityId, eventId, modeloId, bateriaId];
      
      console.log('=== INVALIDANDO QUERIES PARA ATUALIZAR UI ===');
      console.log('Query key principal:', athleteScoresQueryKey);
      
      // Invalidar a query principal da tabela
      await queryClient.invalidateQueries({
        queryKey: athleteScoresQueryKey
      });
      
      // Forçar refetch imediato
      await queryClient.refetchQueries({
        queryKey: athleteScoresQueryKey
      });
      
      // Invalidar queries relacionadas
      await queryClient.invalidateQueries({
        queryKey: ['campos-modelo', modeloId]
      });

      // Aguardar um momento e fazer outro refetch para garantir
      setTimeout(async () => {
        console.log('Refetch tardio para garantir atualização...');
        await queryClient.refetchQueries({
          queryKey: athleteScoresQueryKey
        });
      }, 500);

      console.log('=== CÁLCULO DE COLOCAÇÕES CONCLUÍDO COM SUCESSO ===');
      
      toast.success(`Colocações calculadas para ${scoredAthletes.length} atletas com base no campo "${referenceField}". As colocações foram atualizadas na tabela.`);
      
    } catch (error) {
      console.error('Erro ao calcular colocações:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao calcular colocações');
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    isCalculating,
    calculateBatchPlacements
  };
}
