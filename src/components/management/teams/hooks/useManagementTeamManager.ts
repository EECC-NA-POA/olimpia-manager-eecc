
import { useState } from 'react';
import { useModalitiesData } from '../../../judge/tabs/teams/hooks/useModalitiesData';
import { useTeamsData } from '../../../judge/tabs/teams/hooks/useTeamsData';
import { useAvailableAthletesData } from '../../../judge/tabs/teams/hooks/useAvailableAthletesData';
import { useManagementTeamMutations } from './useManagementTeamMutations';
import { TeamData } from '../../../judge/tabs/teams/types';

export function useManagementTeamManager(eventId: string | null, isOrganizer: boolean) {
  const [selectedModalityId, setSelectedModalityId] = useState<number | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<TeamData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch modalities
  const { data: modalities } = useModalitiesData(eventId);

  // Fetch teams for selected modality
  const { data: teams, isLoading: isLoadingTeams } = useTeamsData(
    eventId,
    selectedModalityId,
    isOrganizer,
    modalities || []
  );

  // Fetch available athletes for selected modality
  const { data: availableAthletes } = useAvailableAthletesData(
    eventId,
    selectedModalityId,
    isOrganizer,
    teams || []
  );

  // Team mutations
  const {
    createTeam,
    deleteTeam,
    addAthlete,
    removeAthlete,
    updateAthletePosition,
    isCreatingTeam,
    isDeletingTeam,
    isAddingAthlete,
    isRemovingAthlete,
    isUpdatingAthlete
  } = useManagementTeamMutations(eventId, selectedModalityId, isOrganizer);

  // Handle team deletion with custom dialog
  const handleDeleteTeam = (teamId: number) => {
    const team = teams?.find(t => t.id === teamId);
    if (!team) return;

    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  };

  // Confirm team deletion
  const confirmDeleteTeam = () => {
    if (teamToDelete) {
      deleteTeam(teamToDelete.id);
      setIsDeleteDialogOpen(false);
      setTeamToDelete(null);
    }
  };

  // Cancel team deletion
  const cancelDeleteTeam = () => {
    setIsDeleteDialogOpen(false);
    setTeamToDelete(null);
  };

  return {
    modalities: modalities || [],
    teams: teams || [],
    availableAthletes: availableAthletes || [],
    selectedModalityId,
    setSelectedModalityId,
    isLoading: isLoadingTeams,
    createTeam,
    deleteTeam: handleDeleteTeam,
    addAthlete,
    removeAthlete,
    updateAthletePosition,
    isCreatingTeam,
    isDeletingTeam,
    isAddingAthlete,
    isRemovingAthlete,
    isUpdatingAthlete,
    // Delete dialog state
    teamToDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen: setIsDeleteDialogOpen,
    confirmDeleteTeam,
    cancelDeleteTeam
  };
}
