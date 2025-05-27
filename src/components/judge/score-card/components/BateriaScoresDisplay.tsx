
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BateriaScoreItem } from './bateria-scores/BateriaScoreItem';
import { useBateriaScores } from './bateria-scores/hooks/useBateriaScores';
import { useScoreMutation } from './bateria-scores/hooks/useScoreMutation';
import { BateriaScoresDisplayProps } from './bateria-scores/types';

export function BateriaScoresDisplay({ 
  athleteId, 
  modalityId, 
  eventId, 
  judgeId,
  baterias,
  scoreType 
}: BateriaScoresDisplayProps) {
  console.log('BateriaScoresDisplay - Props:', { athleteId, modalityId, eventId, baterias });

  const { batteriaScores, isLoadingScores } = useBateriaScores({
    athleteId,
    modalityId,
    eventId,
    baterias
  });

  const { updateScoreMutation } = useScoreMutation({
    athleteId,
    modalityId,
    eventId,
    judgeId
  });

  const handleSave = (scoreId: number, newValues: any) => {
    updateScoreMutation.mutate({ scoreId, newValues });
  };

  if (isLoadingScores) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Carregando pontuações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-blue-800">Pontuações por Bateria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {baterias.map((bateria) => {
          const score = batteriaScores?.find(s => s.bateria_id === bateria.id);
          
          return (
            <BateriaScoreItem
              key={bateria.id}
              bateria={bateria}
              score={score}
              scoreType={scoreType}
              onSave={handleSave}
              isPending={updateScoreMutation.isPending}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
