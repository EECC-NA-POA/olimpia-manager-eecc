
import { useState } from 'react';
import { useModalitiesData } from './useModalitiesData';
import { useTeamsData } from './useTeamsData';
import { useAvailableAthletesData } from './useAvailableAthletesData';
import { useTeamMutations } from './useTeamMutations';
import { TeamData } from '../types';

export function useTeamManager(eventId: string | null, isOrganizer: boolean) {
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
  } = useTeamMutations(eventId, selectedModalityId, isOrganizer);

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
