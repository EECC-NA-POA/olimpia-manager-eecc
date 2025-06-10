
import React from 'react';
import { AthleteCard } from './AthleteCard';

interface SortableAthleteProps {
  athlete: any;
  id: string;
  isSelected?: boolean;
  onSelect?: () => void;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType: 'tempo' | 'distancia' | 'pontos';
  modalityRule?: any;
}

export function SortableAthlete({ 
  athlete, 
  id, 
  isSelected, 
  onSelect,
  modalityId,
  eventId,
  judgeId,
  scoreType,
  modalityRule
}: SortableAthleteProps) {
  return (
    <div className="cursor-move">
      <AthleteCard 
        athlete={athlete} 
        isSelected={isSelected} 
        onSelect={onSelect}
        modalityId={modalityId}
        eventId={eventId}
        judgeId={judgeId}
        scoreType={scoreType}
        modalityRule={modalityRule}
      />
    </div>
  );
}
