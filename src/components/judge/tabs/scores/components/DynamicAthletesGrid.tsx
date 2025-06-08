
import React from 'react';
import { AthleteScoreCard } from '../../../score-card/AthleteScoreCard';
import { DynamicAthleteScoreCard } from '../../../score-card/DynamicAthleteScoreCard';
import { useModelosModalidade } from '@/hooks/useDynamicScoring';
import { Athlete } from '../hooks/useAthletes';

interface DynamicAthletesGridProps {
  athletes: Athlete[];
  selectedAthleteId: string | null;
  onAthleteSelect: (id: string | null) => void;
  modalityId: number;
  scoreType: 'tempo' | 'distancia' | 'pontos';
  eventId: string | null;
  judgeId: string;
  modalityRule?: any;
}

export function DynamicAthletesGrid({
  athletes,
  selectedAthleteId,
  onAthleteSelect,
  modalityId,
  scoreType,
  eventId,
  judgeId,
  modalityRule
}: DynamicAthletesGridProps) {
  // Check if this modality has dynamic scoring configured
  const { data: modelos = [] } = useModelosModalidade(modalityId);
  const hasDynamicScoring = modelos.length > 0;

  console.log('DynamicAthletesGrid - modalityId:', modalityId);
  console.log('DynamicAthletesGrid - hasDynamicScoring:', hasDynamicScoring);
  console.log('DynamicAthletesGrid - modelos:', modelos);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {athletes.map((athlete) => (
        <div key={athlete.atleta_id}>
          {hasDynamicScoring ? (
            <DynamicAthleteScoreCard
              athlete={athlete}
              modalityId={modalityId}
              eventId={eventId}
              judgeId={judgeId}
              scoreType={scoreType}
            />
          ) : (
            <AthleteScoreCard
              athlete={athlete}
              modalityId={modalityId}
              eventId={eventId}
              judgeId={judgeId}
              scoreType={scoreType}
              modalityRule={modalityRule}
            />
          )}
        </div>
      ))}
    </div>
  );
}
