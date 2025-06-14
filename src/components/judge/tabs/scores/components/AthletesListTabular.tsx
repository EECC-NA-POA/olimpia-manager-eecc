
import React from 'react';
import { Athlete } from '../hooks/useAthletes';
import { AthletesListTabularContainer } from './athletes-list-tabular/AthletesListTabularContainer';

interface AthletesListTabularProps {
  athletes: Athlete[] | undefined;
  isLoading: boolean;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType: 'tempo' | 'distancia' | 'pontos';
}

export function AthletesListTabular({
  athletes,
  isLoading,
  modalityId,
  eventId,
  judgeId,
  scoreType
}: AthletesListTabularProps) {
  return (
    <AthletesListTabularContainer
      athletes={athletes}
      isLoading={isLoading}
      modalityId={modalityId}
      eventId={eventId}
      judgeId={judgeId}
      scoreType={scoreType}
    />
  );
}
