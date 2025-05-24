
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertCircle, Users } from 'lucide-react';
import { useTeamManager } from './teams/hooks/useTeamManager';
import { ModalitySelect } from './teams/components/ModalitySelect';
import { TeamForm } from './teams/components/TeamForm';
import { AthletesList } from './teams/components/AthletesList';
import { TeamCard } from './teams/components/TeamCard';

interface TeamsTabProps {
  userId: string;
  eventId: string | null;
  isOrganizer?: boolean;
}

export function TeamsTab({ userId, eventId, isOrganizer = false }: TeamsTabProps) {
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
        <CardContent className="space-y-6">
          <ModalitySelect
            modalities={modalities}
            value={selectedModalityId}
            onValueChange={setSelectedModalityId}
          />

          {selectedModalityId && (
            <>
              {!isOrganizer && (
                <div className="space-y-4">
                  <TeamForm
                    onCreateTeam={createTeam}
                    isCreating={isCreatingTeam}
                  />
                </div>
              )}

              {isOrganizer && (
                <Alert className="bg-amber-50 border-amber-200">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-amber-800">
                    As equipes são formadas pelos representantes de delegação e não podem ser editadas.
                  </AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="space-y-6">
                  {!isOrganizer && availableAthletes.length > 0 && teams.length > 0 && (
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

                  {!isOrganizer && availableAthletes.length === 0 && teams.length > 0 && (
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
                          {isOrganizer 
                            ? "Ainda não há equipes formadas para esta modalidade."
                            : "Nenhuma equipe criada ainda. Use o formulário acima para criar sua primeira equipe."
                          }
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
                          isReadOnly={isOrganizer}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
