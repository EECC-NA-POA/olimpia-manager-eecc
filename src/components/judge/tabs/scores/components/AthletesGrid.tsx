
import React from 'react';
import { AthleteCard } from '@/components/judge/AthleteCard';
import { Athlete } from '../hooks/useAthletes';

interface AthletesGridProps {
  athletes: Athlete[];
  selectedAthleteId: string | null;
  onAthleteSelect: (athleteId: string | null) => void;
  modalityId: number;
  scoreType: 'tempo' | 'distancia' | 'pontos';
  eventId: string | null;
  judgeId: string;
  modalityRule?: any;
}

export function AthletesGrid({
  athletes,
  selectedAthleteId,
  onAthleteSelect,
  modalityId,
  scoreType,
  eventId,
  judgeId,
  modalityRule
}: AthletesGridProps) {
  const handleAthleteSelect = (athleteId: string) => {
    if (selectedAthleteId === athleteId) {
      onAthleteSelect(null);
    } else {
      onAthleteSelect(athleteId);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {athletes.map((athlete) => (
        <AthleteCard
          key={athlete.atleta_id}
          athlete={athlete}
          isSelected={selectedAthleteId === athlete.atleta_id}
          onSelect={() => handleAthleteSelect(athlete.atleta_id)}
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
