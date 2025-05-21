
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TeamFormation } from '@/components/judge/TeamFormation';
import { useTeamData } from './teams/hooks/useTeamData';
import { ModalitySelector } from './teams/ModalitySelector';
import { TeamCreationForm } from './teams/TeamCreationForm';
import { NoModalitiesCard } from './teams/NoModalitiesCard';
import { TeamsTabProps } from './teams/types';

export function TeamsTab({ userId, eventId, isOrganizer = false }: TeamsTabProps) {
  const {
    modalities,
    isLoadingModalities,
    selectedModalityId,
    setSelectedModalityId,
    existingTeams,
    isLoadingTeams,
    availableAthletes,
    teamName,
    setTeamName,
    createTeamMutation,
    handleCreateTeam
  } = useTeamData(userId, eventId, isOrganizer);

  // Handle modality selection
  const handleModalityChange = (value: string) => {
    setSelectedModalityId(Number(value));
  };

  if (isLoadingModalities) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!modalities || modalities.length === 0) {
    return <NoModalitiesCard />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Formação de Equipes</CardTitle>
          <CardDescription>
            Selecione uma modalidade para gerenciar equipes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <ModalitySelector 
              modalities={modalities}
              onModalityChange={handleModalityChange}
            />
            
            {selectedModalityId && (
              <>
                <TeamCreationForm
                  teamName={teamName}
                  onTeamNameChange={setTeamName}
                  onCreateTeam={handleCreateTeam}
                  isCreating={createTeamMutation.isPending}
                />
                
                {isLoadingTeams ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <TeamFormation 
                    teams={existingTeams || []}
                    availableAthletes={availableAthletes || []}
                    eventId={eventId}
                    modalityId={selectedModalityId}
                    isOrganizer={isOrganizer}
                  />
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
