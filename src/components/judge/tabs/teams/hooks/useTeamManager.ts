
import { useState } from 'react';
import { useModalitiesData } from './useModalitiesData';
import { useTeamsData } from './useTeamsData';
import { useAvailableAthletesData } from './useAvailableAthletesData';
import { useTeamMutations } from './useTeamMutations';

export function useTeamManager(eventId: string | null, isOrganizer: boolean = false) {
  const [selectedModalityId, setSelectedModalityId] = useState<number | null>(null);

  // Fetch modalities
  const { data: modalities = [], isLoading: loadingModalities } = useModalitiesData(eventId);

  // Fetch teams
  const { data: teams = [], isLoading: loadingTeams } = useTeamsData(
    eventId, 
    selectedModalityId, 
    isOrganizer, 
    modalities
  );

  // Fetch available athletes
  const { data: availableAthletes = [], isLoading: loadingAthletes } = useAvailableAthletesData(
    eventId,
    selectedModalityId,
    isOrganizer,
    teams
  );

  // Team mutations
  const {
    createTeam,
    addAthlete,
    removeAthlete,
    isCreatingTeam,
    isAddingAthlete,
    isRemovingAthlete
  } = useTeamMutations(eventId, selectedModalityId, isOrganizer);

  return {
    modalities,
    teams,
    availableAthletes,
    selectedModalityId,
    setSelectedModalityId,
    isLoading: loadingModalities || loadingTeams || loadingAthletes,
    createTeam,
    addAthlete,
    removeAthlete,
    isCreatingTeam,
    isAddingAthlete,
    isRemovingAthlete
  };
}
