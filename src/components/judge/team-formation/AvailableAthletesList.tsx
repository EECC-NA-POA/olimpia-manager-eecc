
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, MapPin, Plus } from 'lucide-react';
import { AvailableAthlete, Team } from '../tabs/teams/types';

interface AvailableAthletesListProps {
  athletes: AvailableAthlete[];
  teams: Team[];
  onAddAthleteToTeam: (teamId: number, athleteId: string) => void;
  isPending: boolean;
}

export function AvailableAthletesList({ 
  athletes, 
  teams, 
  onAddAthleteToTeam, 
  isPending 
}: AvailableAthletesListProps) {
  const [selectedTeams, setSelectedTeams] = React.useState<{ [athleteId: string]: number }>({});

  const handleAddAthlete = (athleteId: string) => {
    const teamId = selectedTeams[athleteId];
    if (teamId) {
      onAddAthleteToTeam(teamId, athleteId);
      // Clear selection after adding
      setSelectedTeams(prev => ({ ...prev, [athleteId]: 0 }));
    }
  };

  if (athletes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Adicionar Atletas às Equipes</h3>
      
      {/* Three cards per row layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {athletes.map((athlete) => (
          <Card key={athlete.id} className="p-4">
            <CardContent className="p-0 space-y-3">
              {/* Athlete Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{athlete.nome}</span>
                </div>
                
                {athlete.filial_nome && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{athlete.filial_nome}</span>
                  </div>
                )}
              </div>

              {/* Team Selection and Add Button */}
              <div className="space-y-2">
                <Select
                  value={selectedTeams[athlete.id]?.toString() || ""}
                  onValueChange={(value) => 
                    setSelectedTeams(prev => ({ 
                      ...prev, 
                      [athlete.id]: parseInt(value) 
                    }))
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecionar equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  size="sm"
                  onClick={() => handleAddAthlete(athlete.id)}
                  disabled={!selectedTeams[athlete.id] || isPending}
                  className="w-full h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
