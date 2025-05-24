
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
    console.log('handleAddAthleteToTeam called:', { teamId, athleteId });
    
    if (isOrganizer) {
      console.log('Organizer cannot add athletes to teams');
      return;
    }

    addAthleteMutation.mutate({ teamId, athleteId });
  };

  const handleRemoveAthleteFromTeam = async (athleteTeamId: number) => {
    console.log('handleRemoveAthleteFromTeam called:', { athleteTeamId });
    
    if (isOrganizer) {
      console.log('Organizer cannot remove athletes from teams');
      return;
    }

    removeAthleteMutation.mutate(athleteTeamId);
  };

  const handleUpdateLane = async (athleteTeamId: number, lane: number | null) => {
    console.log('handleUpdateLane called:', { athleteTeamId, lane });
    
    if (isOrganizer) {
      console.log('Organizer cannot update athlete lanes');
      return;
    }

    updateLaneMutation.mutate({ athleteTeamId, lane });
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
