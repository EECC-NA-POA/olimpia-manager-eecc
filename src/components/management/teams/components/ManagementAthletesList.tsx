
import React from 'react';

interface AthleteOption {
  id: string;
  nome: string;
}

interface TeamData {
  id: number;
  nome: string;
  atletas: any[];
}

interface ManagementAthletesListProps {
  athletes: AthleteOption[];
  teams: TeamData[];
  onAddAthlete: (data: { teamId: number; athleteId: string }) => void;
  isAdding: boolean;
  isOrganizer: boolean;
}

export function ManagementAthletesList({
  athletes,
  teams,
  onAddAthlete,
  isAdding,
  isOrganizer
}: ManagementAthletesListProps) {
  if (athletes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Todos os atletas já estão em equipes ou não há atletas disponíveis.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Atletas Disponíveis</h3>
      <div className="grid gap-4">
        {athletes.map((athlete) => (
          <div key={athlete.id} className="flex items-center justify-between p-4 border rounded-lg">
            <span>{athlete.nome}</span>
            <div className="space-x-2">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => onAddAthlete({ teamId: team.id, athleteId: athlete.id })}
                  disabled={isAdding}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  Adicionar à {team.nome}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
