
import React from 'react';

interface EmptyAthletesListProps {
  selectedBateriaId?: number | null;
}

export function EmptyAthletesList({ selectedBateriaId }: EmptyAthletesListProps) {
  const getBateriaDisplayName = (bateriaId: number | null) => {
    if (bateriaId === 999) return 'Final';
    return bateriaId?.toString() || '';
  };

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
