
import React from 'react';
import { AthleteCard } from '@/components/judge/AthleteCard';
import { AthleteWithBranchData } from './types';

interface AthletesGridProps {
  athletes: AthleteWithBranchData[];
  selectedAthleteId: string | null;
  onAthleteSelect: (athleteId: string | null) => void;
  modalityId: number;
  scoreType?: 'tempo' | 'distancia' | 'pontos';
  eventId: string | null;
  judgeId: string;
}

export function AthletesGrid({
  athletes,
  selectedAthleteId,
  onAthleteSelect,
  modalityId,
  scoreType,
  eventId,
  judgeId
}: AthletesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {athletes.map((athlete) => (
        <AthleteCard
          key={athlete.atleta_id}
          athlete={athlete}
          isSelected={selectedAthleteId === athlete.atleta_id}
          onClick={() => onAthleteSelect(
            selectedAthleteId === athlete.atleta_id ? null : athlete.atleta_id
          )}
          modalityId={modalityId}
          scoreType={scoreType}
          eventId={eventId}
          judgeId={judgeId}
        />
      ))}
    </div>
  );
}
