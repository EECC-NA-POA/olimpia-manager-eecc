
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { useTeamOperations } from './teams/hooks/useTeamOperations';
import { TeamFormDialog } from './teams/TeamFormDialog';
import { TeamsList } from './teams/TeamsList';
import { useQueryClient } from '@tanstack/react-query';

interface TeamsTabProps {
  eventId: string | null;
  branchId?: string;
}

export function TeamsTab({ eventId, branchId }: TeamsTabProps) {
  const queryClient = useQueryClient();
  
  console.log('TeamsTab - eventId:', eventId, 'branchId:', branchId);
  
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
  } = useTeamOperations(eventId, branchId);

  console.log('TeamsTab - Loading states:', { isLoadingTeams, isLoadingModalities });
  console.log('TeamsTab - Error states:', { teamsError, modalitiesError });
  console.log('TeamsTab - Data:', { teams, teamModalities });

  // Loading state
  if (isLoadingTeams || isLoadingModalities) {
    return <LoadingState />;
  }

  // Error state
  if (teamsError || modalitiesError) {
    console.error('TeamsTab - Errors:', { teamsError, modalitiesError });
    return (
      <ErrorState 
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['teams', eventId, branchId] })} 
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
        <h2 className="text-2xl font-bold text-olimpics-green-primary">Gerenciamento de Equipes</h2>
        
        <Button 
          onClick={handleNewTeamClick}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Nova Equipe
        </Button>
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
      
      {/* Teams List */}
      <TeamsList 
        teams={teams || []}
        onEditTeam={handleEditTeam}
        onDeleteTeam={handleDeleteTeam}
      />
    </div>
  );
}
