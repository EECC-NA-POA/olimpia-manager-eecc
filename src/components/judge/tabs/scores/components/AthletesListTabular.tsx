
import React from 'react';
import { Athlete, useAthletes } from '../hooks/useAthletes';
import { AthletesListTabularContainer } from './athletes-list-tabular/AthletesListTabularContainer';

interface AthletesListTabularProps {
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType: 'tempo' | 'distancia' | 'pontos';
}

export function AthletesListTabular({
  modalityId,
  eventId,
  judgeId,
  scoreType
}: AthletesListTabularProps) {
  const { data: athletes, isLoading, error } = useAthletes(modalityId, eventId);

  console.log('=== ATHLETES LIST TABULAR ===');
  console.log('Dados recebidos do hook useAthletes:', {
    athletes: athletes?.length || 0,
    isLoading,
    error,
    modalityId,
    eventId
  });

  return (
    <AthletesListTabularContainer
      athletes={athletes}
      isLoading={isLoading}
      modalityId={modalityId}
      eventId={eventId}
      judgeId={judgeId}
      scoreType={scoreType}
      error={error}
    />
  );
}
