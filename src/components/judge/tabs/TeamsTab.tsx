
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeamData } from './teams/hooks/useTeamData';
import { ModalitySelector } from './teams/ModalitySelector';
import { NoModalitiesCard } from './teams/NoModalitiesCard';
import { TeamCreationForm } from './teams/TeamCreationForm';
import { useTeamCreation } from './teams/hooks/useTeamCreation';
import { TeamsTabProps } from './teams/types';
import { Info, AlertCircle } from 'lucide-react';
import { TeamFormation } from '@/components/judge/TeamFormation';
import { NoTeamsMessage } from './teams/NoTeamsMessage';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function TeamsTab({ userId, eventId, isOrganizer = false }: TeamsTabProps) {
  const [teamName, setTeamName] = useState('');
  const {
    modalities,
    isLoadingModalities,
    selectedModalityId,
    setSelectedModalityId,
    existingTeams,
    isLoadingTeams,
    userInfo,
    isLoadingUserInfo,
    userInfoError,
    availableAthletes
  } = useTeamData(userId, eventId, isOrganizer);

  console.log('TeamsTab - Debug info:', {
    userInfo,
    isOrganizer,
    userId,
    isLoadingUserInfo,
    userInfoError: userInfoError?.message
  });

  // Team creation functionality
  const { handleCreateTeam, createTeamMutation } = useTeamCreation(
    userId,
    eventId,
    selectedModalityId,
    userInfo,
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

  // Check if there are any collective modalities available
  console.log('Available modalities:', modalities);
  
  if (!modalities || modalities.length === 0) {
    return <NoModalitiesCard isCollective={true} />;
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
                    {isLoadingUserInfo ? (
                      <Alert className="bg-blue-50 border-blue-200">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <AlertDescription className="text-blue-800 ml-2">
                          Carregando informações do usuário...
                        </AlertDescription>
                      </Alert>
                    ) : userInfoError ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Erro ao carregar informações do usuário: {userInfoError.message}
                        </AlertDescription>
                      </Alert>
                    ) : !userInfo ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Não foi possível carregar as informações do usuário. Verifique se você está logado corretamente.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <TeamCreationForm
                        teamName={teamName}
                        onTeamNameChange={setTeamName}
                        onCreateTeam={handleCreateTeam}
                        isCreating={createTeamMutation.isPending}
                      />
                    )}
                  </div>
                )}
                
                {/* Information message for judges */}
                {isOrganizer && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-amber-800">
                      As equipes são formadas pelos representantes de delegação e não podem ser editadas.
                    </AlertDescription>
                  </Alert>
                )}
                
                {isLoadingTeams ? (
                  <div className="space-y-4">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : existingTeams && existingTeams.length > 0 ? (
                  <TeamFormation 
                    teams={existingTeams}
                    availableAthletes={availableAthletes || []}
                    eventId={eventId}
                    modalityId={selectedModalityId}
                    isOrganizer={isOrganizer}
                    isReadOnly={isOrganizer}
                  />
                ) : (
                  <NoTeamsMessage isOrganizer={isOrganizer} />
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
