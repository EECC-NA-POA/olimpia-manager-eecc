
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface AthleteStatusBadgeProps {
  hasScoreForCurrentModality: boolean;
}

export function AthleteStatusBadge({ hasScoreForCurrentModality }: AthleteStatusBadgeProps) {
  return (
    <div className="flex justify-center pt-2">
      {hasScoreForCurrentModality ? (
        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
          ✓ Avaliado
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          ⏳ Pendente
        </Badge>
      )}
    </div>
  );
}
