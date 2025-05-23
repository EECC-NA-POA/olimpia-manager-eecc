
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvailableAthlete, Team } from '../tabs/teams/types';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
  const [searchTerm, setSearchTerm] = useState('');

  console.log('AvailableAthletesList rendered with:', {
    athletesCount: athletes.length,
    teamsCount: teams.length,
    athletes: athletes
  });

  if (athletes.length === 0) {
    console.log('No athletes available, not rendering component');
    return null;
  }

  // If there are no teams, show a message
  if (teams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adicionar Atletas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Crie uma equipe primeiro para adicionar atletas.</p>
        </CardContent>
      </Card>
    );
  }

  // Filter athletes based on search term
  const filteredAthletes = athletes.filter(athlete => {
    const nameMatch = athlete.atleta_nome?.toLowerCase().includes(searchTerm.toLowerCase());
    const docMatch = athlete.numero_documento?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || docMatch;
  });

  console.log('Filtered athletes:', filteredAthletes.length);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Adicionar Atletas às Equipes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar atleta por nome ou documento"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAthletes.map((athlete) => (
            <div
              key={athlete.atleta_id}
              className="border rounded-md p-3 flex flex-col gap-2"
            >
              <div>
                <p className="font-medium truncate">{athlete.name || athlete.atleta_nome}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {athlete.tipo_documento}: {athlete.numero_documento}
                </p>
              </div>
              
              {teams.length === 1 ? (
                // If there's only one team, show a single add button
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => onAddAthleteToTeam(teams[0].id, athlete.atleta_id)}
                  disabled={isPending}
                >
                  {isPending ? 'Adicionando...' : 'Adicionar a ' + teams[0].nome}
                </Button>
              ) : (
                // If there are multiple teams, show a dropdown
                <select 
                  className="border rounded px-2 py-1 text-sm w-full mt-2"
                  onChange={(e) => {
                    const teamId = Number(e.target.value);
                    if (teamId) {
                      onAddAthleteToTeam(teamId, athlete.atleta_id);
                      e.target.value = ""; // Reset after selection
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
          
          {filteredAthletes.length === 0 && (
            <div className="col-span-full text-center py-4 text-muted-foreground">
              Nenhum atleta disponível encontrado
              {searchTerm && " para a busca: " + searchTerm}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
