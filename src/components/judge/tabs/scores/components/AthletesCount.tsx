
import React from 'react';

interface AthletesCountProps {
  filteredCount: number;
  totalCount: number;
}

export function AthletesCount({ filteredCount, totalCount }: AthletesCountProps) {
  return (
    <div className="text-center text-sm text-muted-foreground">
      Mostrando {filteredCount} de {totalCount} atletas
    </div>
  );
}
