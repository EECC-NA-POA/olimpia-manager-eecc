
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { TeamFormation } from '@/components/judge/TeamFormation';
import { TeamData } from '../types';

interface AllTeamsViewProps {
  teams: TeamData[];
  isOrganizer: boolean;
  eventId: string | null;
  isReadOnly?: boolean;
}

export function AllTeamsView({ teams, isOrganizer, eventId, isReadOnly = false }: AllTeamsViewProps) {
  if (!teams || teams.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Nenhuma equipe encontrada para os filtros aplicados.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group teams by modality
  const teamsByModality = teams.reduce((acc, team) => {
    const modalityId = team.modalidade_id;
    if (!acc[modalityId]) {
      acc[modalityId] = {
        modality: team.modalidade_info,
        teams: []
      };
    }
    acc[modalityId].teams.push(team);
    return acc;
  }, {} as Record<number, { modality: any; teams: TeamData[] }>);

  return (
    <div className="space-y-8">
      {Object.entries(teamsByModality).map(([modalityId, { modality, teams: modalityTeams }]) => (
        <Card key={modalityId}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {modality?.nome || 'Modalidade'}
                </CardTitle>
                <CardDescription>
                  {modality?.categoria} - {modalityTeams.length} equipe{modalityTeams.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {modalityTeams.length} equipe{modalityTeams.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <TeamFormation
              teams={modalityTeams.map(team => ({
                id: team.id,
                nome: team.nome,
                modalidade_id: team.modalidade_id,
                observacoes: '',
                athletes: team.atletas.map(athlete => ({
                  id: athlete.id,
                  atleta_id: athlete.atleta_id,
                  atleta_nome: athlete.atleta_nome,
                  posicao: athlete.posicao,
                  raia: athlete.raia || 0,
                  tipo_documento: athlete.documento.split(':')[0] || '',
                  numero_documento: athlete.documento.split(':')[1]?.trim() || ''
                })),
                modalidades: {
                  id: modality?.id || 0,
                  nome: modality?.nome || '',
                  categoria: modality?.categoria || ''
                }
              }))}
              availableAthletes={[]}
              eventId={eventId}
              modalityId={parseInt(modalityId)}
              isOrganizer={isOrganizer}
              isReadOnly={isReadOnly}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
