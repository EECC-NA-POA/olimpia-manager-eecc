
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
  
  console.log('TeamsTab - Current user branch:', userBranchId);
  console.log('TeamsTab - Selected modality:', selectedModalityId);
  
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

  // Get teams for selected modality (following organizer pattern)
  const { data: modalityTeams, isLoading: isLoadingModalityTeams, error: modalityTeamsError } = useTeamsDataForDelegation(
    eventId,
    selectedModalityId,
    userBranchId
  );

  console.log('TeamsTab - Modality teams:', modalityTeams);

  // Get available athletes for the selected modality (filtered by branch for delegation)
  const { data: availableAthletes, isLoading: isLoadingAthletes, error: athletesError } = useAvailableAthletesData(
    eventId,
    selectedModalityId,
    false, // isOrganizer = false (delegation representative)
    modalityTeams || []
  );

  console.log('TeamsTab - Available athletes:', availableAthletes);

  // Loading state
  if (isLoadingTeams || isLoadingModalities) {
    return <LoadingState />;
  }

  // Error state
  if (teamsError || modalitiesError) {
    console.error('TeamsTab - Error:', { teamsError, modalitiesError });
    return (
      <ErrorState 
        onRetry={() => {
          queryClient.invalidateQueries({ queryKey: ['teams', eventId, userBranchId] });
          queryClient.invalidateQueries({ queryKey: ['team-modalities', eventId] });
        }} 
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

      {/* Modality Selector (following organizer pattern) */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Selecione uma modalidade coletiva:</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {teamModalities?.map((modality) => (
              <Button
                key={modality.id}
                variant={selectedModalityId === modality.id ? "default" : "outline"}
                onClick={() => {
                  console.log('Selecting modality:', modality.id, modality.nome);
                  setSelectedModalityId(modality.id);
                }}
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
            
            {/* Show loading states and errors for modality-specific data */}
            {(isLoadingModalityTeams || isLoadingAthletes) ? (
              <LoadingState />
            ) : modalityTeamsError || athletesError ? (
              <div className="space-y-4">
                {modalityTeamsError && (
                  <div className="text-red-600 text-sm">
                    Erro ao carregar equipes: {modalityTeamsError.message}
                  </div>
                )}
                {athletesError && (
                  <div className="text-red-600 text-sm">
                    Erro ao carregar atletas: {athletesError.message}
                  </div>
                )}
                <ErrorState 
                  onRetry={() => {
                    queryClient.invalidateQueries({ queryKey: ['teams-delegation', eventId, selectedModalityId, userBranchId] });
                    queryClient.invalidateQueries({ queryKey: ['available-athletes', eventId, selectedModalityId] });
                  }} 
                />
              </div>
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
