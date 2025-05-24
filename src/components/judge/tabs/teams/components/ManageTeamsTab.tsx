
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertCircle, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ModalitySelect } from './ModalitySelect';
import { TeamForm } from './TeamForm';
import { AthletesList } from './AthletesList';
import { TeamCard } from './TeamCard';
import { ModalityOption, TeamData, AthleteOption } from '../types';

interface ManageTeamsTabProps {
  modalities: ModalityOption[];
  teams: TeamData[];
  availableAthletes: AthleteOption[];
  selectedModalityId: number | null;
  setSelectedModalityId: (id: number) => void;
  isLoading: boolean;
  createTeam: (name: string) => void;
  addAthlete: (params: { teamId: number; athleteId: string }) => void;
  removeAthlete: (athleteTeamId: number) => void;
  updateAthletePosition: (params: { athleteTeamId: number; posicao?: number; raia?: number }) => void;
  isCreatingTeam: boolean;
  isAddingAthlete: boolean;
  isRemovingAthlete: boolean;
  isUpdatingAthlete: boolean;
  isOrganizer?: boolean;
}

export function ManageTeamsTab({
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
  isUpdatingAthlete,
  isOrganizer = false
}: ManageTeamsTabProps) {
  const handleAddAthlete = (teamId: number, athleteId: string) => {
    addAthlete({ teamId, athleteId });
  };

  const handleUpdateAthletePosition = (athleteTeamId: number, posicao?: number, raia?: number) => {
    updateAthletePosition({ athleteTeamId, posicao, raia });
  };

  return (
    <div className="space-y-6 mt-6">
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
                      {isOrganizer && " Como organizador, você pode misturar atletas de diferentes filiais."}
                      {!isOrganizer && " Após adicionar, você pode definir a posição e raia de cada atleta."}
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
                    {isOrganizer 
                      ? "Todos os atletas desta modalidade já estão em equipes."
                      : "Todos os atletas da sua filial já estão em equipes ou não há mais atletas disponíveis para esta modalidade."
                    }
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
                      isOrganizer={isOrganizer}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
