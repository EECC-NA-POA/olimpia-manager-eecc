
import { useState } from 'react';
import { useModalitiesData } from './useModalitiesData';
import { useTeamsData } from './useTeamsData';
import { useAvailableAthletesData } from './useAvailableAthletesData';
import { useTeamMutations } from './useTeamMutations';

export function useTeamManager(eventId: string | null, isOrganizer: boolean) {
  const [selectedModalityId, setSelectedModalityId] = useState<number | null>(null);

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

  // Handle team deletion with confirmation
  const handleDeleteTeam = (teamId: number) => {
    const team = teams?.find(t => t.id === teamId);
    if (!team) return;

    const athleteCount = team.atletas.length;
    let confirmMessage = `Tem certeza que deseja excluir a equipe "${team.nome}"?`;
    
    if (athleteCount > 0) {
      confirmMessage += `\n\nEsta ação irá remover ${athleteCount} atleta${athleteCount > 1 ? 's' : ''} da equipe e excluir todos os registros relacionados.`;
    }

    if (window.confirm(confirmMessage)) {
      deleteTeam(teamId);
    }
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
    isUpdatingAthlete
  };
}
