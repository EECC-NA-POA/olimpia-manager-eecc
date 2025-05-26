
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TeamFilters } from './TeamFilters';
import { TeamScoreCard } from '../../../score-card/components/TeamScoreCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Team {
  equipe_id: number;
  equipe_nome: string;
  modalidade_id: number;
  modalidade_nome: string;
  tipo_pontuacao: string;
  filial_nome: string;
  members: Array<{
    atleta_id: string;
    atleta_nome: string;
    numero_identificador?: string;
  }>;
}

interface Modality {
  modalidade_id: number;
  modalidade_nome: string;
}

interface Branch {
  id: string;
  nome: string;
}

interface ViewAllTeamsTabProps {
  allTeams: Team[];
  allModalities: Modality[];
  branches: Branch[];
  isLoadingAllTeams: boolean;
  allTeamsError: Error | null;
  modalityFilter: number | null;
  branchFilter: string | null;
  searchTerm: string;
  setModalityFilter: (value: number | null) => void;
  setBranchFilter: (value: string | null) => void;
  setSearchTerm: (value: string) => void;
  isOrganizer: boolean;
  eventId: string | null;
  isReadOnly?: boolean;
  judgeId?: string;
}

export function ViewAllTeamsTab({
  allTeams,
  allModalities,
  branches,
  isLoadingAllTeams,
  allTeamsError,
  modalityFilter,
  branchFilter,
  searchTerm,
  setModalityFilter,
  setBranchFilter,
  setSearchTerm,
  isOrganizer,
  eventId,
  isReadOnly = false,
  judgeId
}: ViewAllTeamsTabProps) {
  if (isLoadingAllTeams) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (allTeamsError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar equipes: {allTeamsError.message}
        </AlertDescription>
      </Alert>
    );
  }

  // Group teams by modality for better organization
  const teamsByModality = allTeams.reduce((acc, team) => {
    const modalityId = team.modalidade_id;
    if (!acc[modalityId]) {
      acc[modalityId] = {
        modalidade_nome: team.modalidade_nome,
        tipo_pontuacao: team.tipo_pontuacao,
        teams: []
      };
    }
    acc[modalityId].teams.push(team);
    return acc;
  }, {} as Record<number, { modalidade_nome: string; tipo_pontuacao: string; teams: Team[] }>);

  return (
    <div className="space-y-6">
      <TeamFilters
        modalities={allModalities}
        branches={branches}
        modalityFilter={modalityFilter}
        branchFilter={branchFilter}
        searchTerm={searchTerm}
        onModalityFilterChange={setModalityFilter}
        onBranchFilterChange={setBranchFilter}
        onSearchTermChange={setSearchTerm}
        showBranchFilter={isOrganizer}
      />

      {Object.keys(teamsByModality).length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Nenhuma equipe encontrada com os filtros aplicados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(teamsByModality).map(([modalityId, modalityData]) => {
            const scoreType = modalityData.tipo_pontuacao as 'tempo' | 'distancia' | 'pontos';
            
            return (
              <div key={modalityId} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{modalityData.modalidade_nome}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {scoreType === 'tempo' && 'Tempo'}
                          {scoreType === 'distancia' && 'Distância'}
                          {scoreType === 'pontos' && 'Pontos'}
                        </Badge>
                        <Badge variant="outline">
                          {modalityData.teams.length} equipe{modalityData.teams.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {modalityData.teams.map((team) => {
                    // For judges, show score cards; for others, show read-only view
                    if (!isReadOnly && judgeId) {
                      return (
                        <TeamScoreCard
                          key={`${team.equipe_id}-${team.modalidade_id}`}
                          team={{
                            equipe_id: team.equipe_id,
                            equipe_nome: team.equipe_nome,
                            members: team.members
                          }}
                          modalityId={parseInt(modalityId)}
                          eventId={eventId}
                          judgeId={judgeId}
                          scoreType={scoreType}
                        />
                      );
                    }

                    // Read-only view for organizers/representatives
                    return (
                      <Card key={`${team.equipe_id}-${team.modalidade_id}`}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {team.equipe_nome}
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {team.filial_nome}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              Membros ({team.members.length}):
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {team.members.map((member) => (
                                <Badge key={member.atleta_id} variant="outline" className="text-xs">
                                  {member.atleta_nome}
                                  {member.numero_identificador && ` (${member.numero_identificador})`}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
