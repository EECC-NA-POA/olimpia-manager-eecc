
import React from 'react';

interface EmptyStateMessageProps {
  hasAthletes: boolean;
  selectedBateriaId?: number | null;
}

export function EmptyStateMessage({ hasAthletes, selectedBateriaId }: EmptyStateMessageProps) {
  const getBateriaDisplayName = (bateriaId: number | null) => {
    if (bateriaId === 999) return 'Final';
    return bateriaId?.toString() || '';
  };

  if (hasAthletes) {
    return null;
  }

  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">
        {selectedBateriaId 
          ? `Nenhum atleta disponível para a bateria ${getBateriaDisplayName(selectedBateriaId)}`
          : 'Nenhum atleta inscrito nesta modalidade'
        }
      </p>
    </div>
  );
}
