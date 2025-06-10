
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AthleteScoreCard } from './score-card/AthleteScoreCard';
import { Athlete } from './tabs/scores/hooks/useAthletes';

interface AthleteCardProps {
  athlete: Athlete;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType: 'tempo' | 'distancia' | 'pontos';
  modalityRule?: any;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function AthleteCard({
  athlete,
  modalityId,
  eventId,
  judgeId,
  scoreType,
  modalityRule,
  isSelected = false,
  onSelect
}: AthleteCardProps) {
  return (
    <Card className={`cursor-pointer transition-all duration-200 ${
      isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
    }`}>
      <CardContent className="p-0">
        <AthleteScoreCard
          athlete={athlete}
          modalityId={modalityId}
          eventId={eventId}
          judgeId={judgeId}
          scoreType={scoreType}
          modalityRule={modalityRule}
        />
      </CardContent>
    </Card>
  );
}
