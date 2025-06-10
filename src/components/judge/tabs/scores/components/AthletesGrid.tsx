
import React, { useState } from 'react';
import { AthleteCard } from '@/components/judge/AthleteCard';
import { Athlete } from '../hooks/useAthletes';

interface AthletesGridProps {
  athletes: Athlete[];
  modalityId: number;
  scoreType: 'tempo' | 'distancia' | 'pontos';
  eventId: string | null;
  judgeId: string;
  modalityRule?: any;
}

export function AthletesGrid({
  athletes,
  modalityId,
  scoreType,
  eventId,
  judgeId,
  modalityRule
}: AthletesGridProps) {
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  const handleAthleteClick = (athleteId: string) => {
    if (selectedAthleteId === athleteId) {
      setSelectedAthleteId(null);
    } else {
      setSelectedAthleteId(athleteId);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {athletes.map((athlete) => (
        <AthleteCard
          key={athlete.atleta_id}
          athlete={athlete}
          isSelected={selectedAthleteId === athlete.atleta_id}
          onClick={() => handleAthleteClick(athlete.atleta_id)}
          modalityId={modalityId}
          scoreType={scoreType}
          eventId={eventId}
          judgeId={judgeId}
          modalityRule={modalityRule}
        />
      ))}
    </div>
  );
}
