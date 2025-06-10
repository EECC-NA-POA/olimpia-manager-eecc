
import React, { useState } from 'react';
import { AthleteScoreCard } from '../../../score-card/AthleteScoreCard';
import { DynamicAthleteScoreCard } from '../../../score-card/DynamicAthleteScoreCard';
import { useModelosModalidade, useCamposModelo } from '@/hooks/useDynamicScoring';
import { Athlete } from '../hooks/useAthletes';

interface DynamicAthletesGridProps {
  athletes: Athlete[];
  modalityId: number;
  scoreType: 'tempo' | 'distancia' | 'pontos';
  eventId: string | null;
  judgeId: string;
  modalityRule?: any;
  modelo: any;
}

export function DynamicAthletesGrid({
  athletes,
  modalityId,
  scoreType,
  eventId,
  judgeId,
  modalityRule,
  modelo
}: DynamicAthletesGridProps) {
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  // Get the first model to check if it has fields configured
  const { data: campos = [] } = useCamposModelo(modelo?.id);
  const hasConfiguredFields = campos.length > 0;

  console.log('DynamicAthletesGrid - modalityId:', modalityId);
  console.log('DynamicAthletesGrid - hasConfiguredFields:', hasConfiguredFields);
  console.log('DynamicAthletesGrid - modelo:', modelo);
  console.log('DynamicAthletesGrid - campos:', campos);

  // Only show dynamic scoring if there are configured fields
  const shouldUseDynamicScoring = hasConfiguredFields;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {athletes.map((athlete) => (
        <div key={athlete.atleta_id}>
          {shouldUseDynamicScoring ? (
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
