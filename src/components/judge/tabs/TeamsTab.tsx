import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertCircle, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamManager } from './teams/hooks/useTeamManager';
import { useAllTeamsData } from './teams/hooks/useAllTeamsData';
import { ModalitySelect } from './teams/components/ModalitySelect';
import { TeamForm } from './teams/components/TeamForm';
import { AthletesList } from './teams/components/AthletesList';
import { TeamCard } from './teams/components/TeamCard';
import { TeamFilters } from './teams/components/TeamFilters';
import { AllTeamsView } from './teams/components/AllTeamsView';

interface TeamsTabProps {
  userId: string;
  eventId: string | null;
  isOrganizer?: boolean;
}

export function TeamsTab({ userId, eventId, isOrganizer = false }: TeamsTabProps) {
  const { user } = useAuth();
  
  // States for "Visualizar Todas" tab
  const [modalityFilter, setModalityFilter] = useState<number | null>(null);
  const [branchFilter, setBranchFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    modalities,
    teams,
    availableAthletes,
    selectedModalityId,
    setSelectedModalityId,
    isLoading,
    createTeam,
    addAthlete,
    removeAthlete,
    updateAthletePosition,
    isCreatingTeam,
    isAddingAthlete,
    isRemovingAthlete,
    isUpdatingAthlete
  } = useTeamManager(eventId, isOrganizer);

  // Data for viewing all teams - pass user's branch ID for delegation representatives
  const {
    teams: allTeams,
    modalities: allModalities,
    branches,
    isLoading: isLoadingAllTeams,
    error: allTeamsError
  } = useAllTeamsData(eventId, modalityFilter, branchFilter, searchTerm, user?.filial_id);

  if (isLoading && !selectedModalityId) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!modalities || modalities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Equipes
          </CardTitle>
          <CardDescription>Nenhuma modalidade coletiva encontrada</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Não há modalidades coletivas disponíveis para este evento.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleAddAthlete = (teamId: number, athleteId: string) => {
    addAthlete({ teamId, athleteId });
  };

  const handleUpdateAthletePosition = (athleteTeamId: number, posicao?: number, raia?: number) => {
    updateAthletePosition({ athleteTeamId, posicao, raia });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciamento de Equipes
          </CardTitle>
          <CardDescription>
            {isOrganizer 
              ? "Visualize as equipes formadas pelos representantes de delegação" 
              : "Monte as equipes para as modalidades coletivas e gerencie os atletas"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={isOrganizer ? "view-all" : "manage"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              {!isOrganizer && (
                <TabsTrigger value="manage">Gerenciar Minhas Equipes</TabsTrigger>
              )}
              <TabsTrigger value="view-all">Visualizar Todas as Equipes</TabsTrigger>
            </TabsList>
            
            {!isOrganizer && (
              <TabsContent value="manage" className="space-y-6 mt-6">
                <ModalitySelect
                  modalities={modalities}
                  value={selectedModalityId}
                  onValueChange={setSelectedModalityId}
                />

                {selectedModalityId && (
                  <>
                    <div className="space-y-4">
                      <TeamForm
                        onCreateTeam={createTeam}
                        isCreating={isCreatingTeam}
                      />
                    </div>

                    {isLoading ? (
                      <Skeleton className="h-64 w-full" />
                    ) : (
                      <div className="space-y-6">
                        {availableAthletes.length > 0 && teams.length > 0 && (
                          <>
                            <Alert className="bg-blue-50 border-blue-200">
                              <Info className="h-4 w-4" />
                              <AlertDescription className="text-blue-800">
                                <strong>Atletas Disponíveis:</strong> Selecione os atletas abaixo para adicioná-los às equipes. 
                                Após adicionar, você pode definir a posição e raia de cada atleta.
                              </AlertDescription>
                            </Alert>
                            
                            <AthletesList
                              athletes={availableAthletes}
                              teams={teams}
                              onAddAthlete={handleAddAthlete}
                              isAdding={isAddingAthlete}
                            />
                          </>
                        )}

                        {availableAthletes.length === 0 && teams.length > 0 && (
                          <Alert variant="default" className="bg-green-50 border-green-200">
                            <AlertCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                              Todos os atletas da sua filial já estão em equipes ou não há mais atletas disponíveis para esta modalidade.
                            </AlertDescription>
                          </Alert>
                        )}

                        {teams.length === 0 ? (
                          <Card>
                            <CardContent className="text-center py-8">
                              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                              <p className="text-muted-foreground">
                                Nenhuma equipe criada ainda. Use o formulário acima para criar sua primeira equipe.
                              </p>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="space-y-4">
                            {teams.map((team) => (
                              <TeamCard
                                key={team.id}
                                team={team}
                                onRemoveAthlete={removeAthlete}
                                onUpdatePosition={handleUpdateAthletePosition}
                                isRemoving={isRemovingAthlete}
                                isUpdating={isUpdatingAthlete}
                                isReadOnly={false}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            )}
            
            <TabsContent value="view-all" className="space-y-6 mt-6">
              <TeamFilters
                modalities={allModalities}
                branches={branches}
                selectedModalityId={modalityFilter}
                selectedBranchId={branchFilter}
                searchTerm={searchTerm}
                onModalityChange={setModalityFilter}
                onBranchChange={setBranchFilter}
                onSearchChange={setSearchTerm}
              />

              {allTeamsError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Erro ao carregar as equipes. Tente novamente.
                  </AlertDescription>
                </Alert>
              )}

              <AllTeamsView 
                teams={allTeams}
                isLoading={isLoadingAllTeams}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
