
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
  const athletesResult = useAthletes(modalityId, eventId);
  const { data: athletes, isLoading } = athletesResult;
  
  // Extract error safely with proper typing
  const error = ('error' in athletesResult && typeof athletesResult.error === 'string') 
    ? athletesResult.error 
    : null;

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
