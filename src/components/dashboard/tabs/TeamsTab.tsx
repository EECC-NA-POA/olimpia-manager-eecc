
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { useTeamOperations } from './teams/hooks/useTeamOperations';
import { TeamFormDialog } from './teams/TeamFormDialog';
import { TeamsList } from './teams/TeamsList';
import { TeamFormation } from '../../judge/TeamFormation';
import { useTeamsDataForDelegation } from '../../judge/tabs/teams/hooks/useTeamsDataForDelegation';
import { useAvailableAthletesData } from '../../judge/tabs/teams/hooks/useAvailableAthletesData';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

interface TeamsTabProps {
  eventId: string | null;
  branchId?: string;
}

export function TeamsTab({ eventId, branchId }: TeamsTabProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedModalityId, setSelectedModalityId] = useState<number | null>(null);
  
  // Use branch ID from user if not provided
  const userBranchId = branchId || user?.filial_id;
  
  const {
    teamModalities,
    teams,
    isLoadingModalities,
    isLoadingTeams,
    modalitiesError,
    teamsError,
    isDialogOpen,
    setIsDialogOpen,
    editingTeam,
    teamMutation,
    handleSubmit,
    resetAndCloseDialog,
    handleEditTeam,
    handleDeleteTeam,
    handleNewTeamClick
  } = useTeamOperations(eventId, userBranchId);

  // Get teams for selected modality with athletes from the user's branch
  const { data: modalityTeams, isLoading: isLoadingModalityTeams } = useTeamsDataForDelegation(
    eventId,
    selectedModalityId,
    userBranchId
  );

  // Get available athletes for the selected modality (filtered by branch)
  const { data: availableAthletes, isLoading: isLoadingAthletes } = useAvailableAthletesData(
    eventId,
    selectedModalityId,
    false, // isOrganizer = false
    modalityTeams || []
  );

  // Loading state
  if (isLoadingTeams || isLoadingModalities) {
    return <LoadingState />;
  }

  // Error state
  if (teamsError || modalitiesError) {
    return (
      <ErrorState 
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['teams', eventId, userBranchId] })} 
      />
    );
  }

  // Empty state - No team modalities available
  if (!teamModalities || teamModalities.length === 0) {
    return (
      <EmptyState 
        title="Nenhuma modalidade coletiva disponível" 
        description="Não há modalidades coletivas disponíveis para este evento" 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-olimpics-green-primary">Gerenciamento de Equipes</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie as equipes da sua filial para as modalidades coletivas
          </p>
        </div>
        
        <Button 
          onClick={handleNewTeamClick}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Nova Equipe
        </Button>
      </div>

      {/* Modality Selector */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Selecione uma modalidade coletiva:</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {teamModalities?.map((modality) => (
              <Button
                key={modality.id}
                variant={selectedModalityId === modality.id ? "default" : "outline"}
                onClick={() => setSelectedModalityId(modality.id)}
                className="text-sm"
              >
                {modality.nome} - {modality.categoria}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Team Form Dialog */}
      <TeamFormDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        isSubmitting={teamMutation.isPending}
        editingTeam={editingTeam}
        teamModalities={teamModalities || []}
        resetFormAndDialog={resetAndCloseDialog}
      />
      
      {/* Show team formation interface when a modality is selected */}
      {selectedModalityId && (
        <div className="space-y-6">
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Formação de Equipes - {teamModalities?.find(m => m.id === selectedModalityId)?.nome}
            </h3>
            
            {isLoadingModalityTeams || isLoadingAthletes ? (
              <LoadingState />
            ) : (
              <TeamFormation
                teams={modalityTeams || []}
                availableAthletes={availableAthletes || []}
                eventId={eventId}
                modalityId={selectedModalityId}
                isOrganizer={false}
                isReadOnly={false}
                branchId={userBranchId}
              />
            )}
          </div>
        </div>
      )}
      
      {/* Teams List - Show all teams for the branch */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Todas as Equipes da Filial</h3>
        <TeamsList 
          teams={teams || []}
          onEditTeam={handleEditTeam}
          onDeleteTeam={handleDeleteTeam}
        />
      </div>
    </div>
  );
}
