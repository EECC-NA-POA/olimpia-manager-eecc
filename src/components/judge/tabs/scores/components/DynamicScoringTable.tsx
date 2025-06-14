
import React from 'react';
import { Athlete } from '../hooks/useAthletes';
import { ModeloModalidade } from '@/types/dynamicScoring';
import { DynamicScoringTableMain } from './dynamic-scoring-table/DynamicScoringTableMain';
import { useDynamicScoreData } from './dynamic-scoring-table/hooks/useDynamicScoreData';

interface DynamicScoringTableProps {
  athletes: Athlete[];
  modalityId: number;
  eventId: string;
  judgeId: string;
  modelo: ModeloModalidade;
  selectedBateriaId?: number | null;
}

export function DynamicScoringTable({
  athletes,
  modalityId,
  eventId,
  judgeId,
  modelo,
  selectedBateriaId
}: DynamicScoringTableProps) {
  const { campos, existingScores, refetchScores } = useDynamicScoreData({
    modalityId,
    eventId,
    modeloId: modelo.id
  });

  return (
    <DynamicScoringTableMain
      athletes={athletes}
      modalityId={modalityId}
      eventId={eventId}
      judgeId={judgeId}
      modelo={modelo}
      campos={campos}
      selectedBateriaId={selectedBateriaId}
      existingScores={existingScores}
      refetchScores={refetchScores}
    />
  );
}
