
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface AthleteStatusBadgeProps {
  hasScoreForCurrentModality: boolean;
}

export function AthleteStatusBadge({ hasScoreForCurrentModality }: AthleteStatusBadgeProps) {
  return (
    <div className="flex justify-center pt-2">
      {hasScoreForCurrentModality ? (
        <Badge className="bg-success-background text-success border-success/20 hover:bg-success/10">
          ✓ Avaliado
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-warning-background text-warning border-warning/20">
          ⏳ Pendente
        </Badge>
      )}
    </div>
  );
}
