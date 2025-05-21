
import React, { useState } from 'react';
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
import { NoModalitiesCard } from './teams/NoModalitiesCard';
import { TeamCreationForm } from './teams/TeamCreationForm';
import { useTeamCreation } from './teams/hooks/useTeamCreation';
import { TeamsTabProps } from './teams/types';
import { Info } from 'lucide-react';

export function TeamsTab({ userId, eventId, isOrganizer = false }: TeamsTabProps) {
  const [teamName, setTeamName] = useState('');
  const {
    modalities,
    isLoadingModalities,
    selectedModalityId,
    setSelectedModalityId,
    existingTeams,
    isLoadingTeams,
    availableAthletes,
    userInfo
  } = useTeamData(userId, eventId, isOrganizer);

  // Team creation functionality
  const { handleCreateTeam, createTeamMutation } = useTeamCreation(
    userId,
    eventId,
    selectedModalityId,
    userInfo?.filial_id,
    isOrganizer,
    teamName,
    setTeamName
  );

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
          <CardTitle>Equipes</CardTitle>
          <CardDescription>
            {isOrganizer 
              ? "Gerencie as equipes formadas pelos representantes de delegação" 
              : "Monte as equipes para as modalidades coletivas"
            }
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
                {/* Team creation form for delegation representatives */}
                {!isOrganizer && (
                  <div className="pt-4">
                    <TeamCreationForm
                      teamName={teamName}
                      onTeamNameChange={setTeamName}
                      onCreateTeam={handleCreateTeam}
                      isCreating={createTeamMutation.isPending}
                    />
                  </div>
                )}
                
                {/* Information message for judges */}
                {isOrganizer && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-amber-50 border border-amber-200 text-amber-800">
                    <Info size={16} />
                    <p className="text-sm">As equipes são formadas pelos representantes de delegação e não podem ser editadas.</p>
                  </div>
                )}
                
                {isLoadingTeams ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <TeamFormation 
                    teams={existingTeams || []}
                    availableAthletes={availableAthletes || []}
                    eventId={eventId}
                    modalityId={selectedModalityId}
                    isOrganizer={isOrganizer}
                    isReadOnly={isOrganizer}
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
