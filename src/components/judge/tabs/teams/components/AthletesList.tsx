
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
        <CardTitle className="flex items-center justify-between">
          Atletas Disponíveis
          <Badge variant="secondary">{athletes.length} disponíveis</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {athletes.map((athlete) => (
            <div key={athlete.id} className="border rounded p-3 space-y-2 bg-card">
              <div>
                <p className="font-medium text-sm">{athlete.nome}</p>
                <p className="text-xs text-muted-foreground">{athlete.documento}</p>
              </div>
              
              {teams.length === 1 ? (
                <Button
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => onAddAthlete(teams[0].id, athlete.id)}
                  disabled={isAdding}
                >
                  {isAdding ? 'Adicionando...' : `Adicionar a ${teams[0].nome}`}
                </Button>
              ) : (
                <select
                  className="w-full border rounded px-2 py-1 text-xs bg-background"
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
