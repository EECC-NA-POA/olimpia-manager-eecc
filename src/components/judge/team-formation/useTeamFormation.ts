
import { Team } from '../tabs/teams/types';
import { useTeamAthletes } from '../tabs/teams/hooks/useTeamAthletes';

interface UseTeamFormationProps {
  teams: Team[];
  eventId: string | null;
  modalityId: number;
  isOrganizer: boolean;
  branchId?: string | null;
}

export function useTeamFormation({ 
  teams, 
  eventId, 
  modalityId, 
  isOrganizer,
  branchId 
}: UseTeamFormationProps) {
  const {
    addAthleteToTeam: addAthleteMutation,
    removeAthleteFromTeam: removeAthleteMutation,
    updateAthleteLane: updateLaneMutation
  } = useTeamAthletes(eventId, modalityId, branchId);

  const handleAddAthleteToTeam = async (teamId: number, athleteId: string) => {
    console.log('handleAddAthleteToTeam called:', { teamId, athleteId, isOrganizer });
    
    // Organizers can now add athletes to teams
    addAthleteMutation.mutate({ teamId, athleteId });
  };

  const handleRemoveAthleteFromTeam = async (athleteTeamId: number) => {
    console.log('handleRemoveAthleteFromTeam called:', { athleteTeamId, isOrganizer });
    
    // Organizers can now remove athletes from teams
    removeAthleteMutation.mutate(athleteTeamId);
  };

  const handleUpdateLane = async (teamId: number, athleteId: string, lane: number, position: number) => {
    console.log('handleUpdateLane called:', { teamId, athleteId, lane, position, isOrganizer });
    
    // Organizers can now update athlete lanes
    // Find the athlete team record by teamId and athleteId
    const team = teams.find(t => t.id === teamId);
    const athlete = team?.athletes?.find(a => a.atleta_id === athleteId);
    
    if (athlete) {
      updateLaneMutation.mutate({ athleteTeamId: athlete.id, lane });
    }
  };

  return {
    handleAddAthleteToTeam,
    handleRemoveAthleteFromTeam,
    handleUpdateLane,
    isUpdatePending: updateLaneMutation.isPending,
    isRemovePending: removeAthleteMutation.isPending,
    isAddingAthlete: addAthleteMutation.isPending
  };
}
