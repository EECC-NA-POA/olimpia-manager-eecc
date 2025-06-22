
import React from 'react';

interface EmptyStateMessageProps {
  hasAthletes: boolean;
  selectedBateriaId?: number | null;
  usesBaterias: boolean;
}

export function EmptyStateMessage({ hasAthletes, selectedBateriaId, usesBaterias }: EmptyStateMessageProps) {
  const getBateriaDisplayName = (bateriaId: number | null) => {
    if (bateriaId === 999) return 'Final';
    return bateriaId?.toString() || '';
  };

  console.log('EmptyStateMessage - hasAthletes:', hasAthletes, 'selectedBateriaId:', selectedBateriaId, 'usesBaterias:', usesBaterias);

  if (hasAthletes) {
    return null;
  }

  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">
        {usesBaterias && selectedBateriaId 
          ? `Nenhum atleta disponível para a bateria ${getBateriaDisplayName(selectedBateriaId)}`
          : 'Nenhum atleta inscrito nesta modalidade'
        }
      </p>
    </div>
  );
}
