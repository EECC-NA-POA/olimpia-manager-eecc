
import React from 'react';
import { Button } from '@/components/ui/button';
import { AvailableAthlete, Team } from '../tabs/teams/types';

interface AvailableAthletesListProps {
  athletes: AvailableAthlete[];
  teams: Team[];
  onAddAthleteToTeam: (teamId: number, athleteId: string) => void;
  isPending?: boolean;
}

export function AvailableAthletesList({ 
  athletes, 
  teams,
  onAddAthleteToTeam,
  isPending = false
}: AvailableAthletesListProps) {
  if (athletes.length === 0) {
    return null;
  }

  // If there are no teams, show a message
  if (teams.length === 0) {
    return (
      <div className="mt-4">
        <h4 className="font-medium mb-2">Adicionar Atleta</h4>
        <p className="text-muted-foreground">Crie uma equipe primeiro para adicionar atletas.</p>
      </div>
    );
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
            {teams.length === 1 ? (
              // If there's only one team, show a single add button
              <Button
                size="sm"
                onClick={() => onAddAthleteToTeam(teams[0].id, athlete.atleta_id)}
                disabled={isPending}
              >
                Adicionar
              </Button>
            ) : (
              // If there are multiple teams, show a dropdown or selector
              <select 
                className="border rounded px-2 py-1 text-sm"
                onChange={(e) => {
                  const teamId = Number(e.target.value);
                  if (teamId) {
                    onAddAthleteToTeam(teamId, athlete.atleta_id);
                  }
                }}
                disabled={isPending}
                defaultValue=""
              >
                <option value="" disabled>Selecionar equipe</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.nome}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
