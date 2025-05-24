import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AthleteOption, TeamData } from '../types';

interface AthletesListProps {
  athletes: AthleteOption[];
  teams: TeamData[];
  onAddAthlete: (teamId: number, athleteId: string) => void;
  isAdding: boolean;
}

export function AthletesList({ athletes, teams, onAddAthlete, isAdding }: AthletesListProps) {
  if (athletes.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atletas Disponíveis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {athletes.map((athlete) => (
            <div key={athlete.id} className="border rounded p-3 space-y-2">
              <div>
                <p className="font-medium">{athlete.nome}</p>
                <p className="text-sm text-muted-foreground">{athlete.documento}</p>
              </div>
              
              {teams.length === 1 ? (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => onAddAthlete(teams[0].id, athlete.id)}
                  disabled={isAdding}
                >
                  Adicionar a {teams[0].nome}
                </Button>
              ) : (
                <select
                  className="w-full border rounded px-2 py-1 text-sm"
                  onChange={(e) => {
                    const teamId = Number(e.target.value);
                    if (teamId) {
                      onAddAthlete(teamId, athlete.id);
                      e.target.value = '';
                    }
                  }}
                  disabled={isAdding}
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
      </CardContent>
    </Card>
  );
}
