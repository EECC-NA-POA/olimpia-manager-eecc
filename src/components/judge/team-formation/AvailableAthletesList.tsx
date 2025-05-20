
import React from 'react';
import { Button } from '@/components/ui/button';

interface AvailableAthletesListProps {
  athletes: any[];
  onAddAthlete: (athleteId: string) => void;
  isPending: boolean;
}

export function AvailableAthletesList({ 
  athletes, 
  onAddAthlete, 
  isPending 
}: AvailableAthletesListProps) {
  if (athletes.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="font-medium mb-2">Adicionar Atleta</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {athletes.map((athlete) => (
          <div
            key={athlete.atleta_id}
            className="border rounded-md p-2 flex justify-between items-center"
          >
            <span className="truncate">{athlete.atleta_nome}</span>
            <Button
              size="sm"
              onClick={() => onAddAthlete(athlete.atleta_id)}
              disabled={isPending}
            >
              Adicionar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
