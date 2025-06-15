
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

interface JudgeTeamsScoringTabProps {
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
  eventId: string | null;
  judgeId: string;
}

export function JudgeTeamsScoringTab({
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
  eventId,
  judgeId
}: JudgeTeamsScoringTabProps) {
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

  // Transform modalities for TeamFilters
  const modalityOptions = allModalities.map(modality => ({
    id: modality.modalidade_id,
    nome: modality.modalidade_nome,
    categoria: '', // Default empty category
    tipo_modalidade: 'coletiva' as const
  }));

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
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <h3 className="font-semibold text-blue-800 mb-1">Área de Pontuação de Equipes</h3>
              <p className="text-sm text-blue-600">
                Visualize as equipes cadastradas e registre suas pontuações
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <TeamFilters
        modalities={modalityOptions}
        branches={branches}
        selectedModalityId={modalityFilter}
        selectedBranchId={branchFilter}
        searchTerm={searchTerm}
        onModalityChange={setModalityFilter}
        onBranchChange={setBranchFilter}
        onSearchChange={setSearchTerm}
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
                  {modalityData.teams.map((team) => (
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
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
