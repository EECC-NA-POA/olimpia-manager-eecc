
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AthleteScoreCard } from '@/components/judge/score-card';
import { type Athlete } from '../hooks/useAthletes';

interface AthletesListProps {
  athletes: Athlete[] | undefined;
  isLoading: boolean;
  modalityId: number | null;
  eventId: string | null;
  judgeId: string;
  scoreType?: 'time' | 'distance' | 'points';
}

export function AthletesList({ 
  athletes, 
  isLoading, 
  modalityId, 
  eventId, 
  judgeId,
  scoreType = 'points'
}: AthletesListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (!athletes || athletes.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">
            Nenhum atleta encontrado para esta modalidade
          </p>
        </CardContent>
      </Card>
    );
  }

  console.log('Rendering athletes:', athletes);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {athletes.map((athlete) => (
        <AthleteScoreCard 
          key={athlete.atleta_id}
          athlete={athlete}
          modalityId={modalityId!}
          eventId={eventId}
          judgeId={judgeId}
          scoreType={scoreType}
        />
      ))}
    </div>
  );
}
