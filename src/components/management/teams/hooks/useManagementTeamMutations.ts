
import { useCreateTeamMutation } from '../../../judge/tabs/teams/hooks/mutations/useCreateTeamMutation';
import { useDeleteTeamMutation } from '../../../judge/tabs/teams/hooks/mutations/useDeleteTeamMutation';
import { useAddAthleteMutation } from '../../../judge/tabs/teams/hooks/mutations/useAddAthleteMutation';
import { useRemoveAthleteMutation } from '../../../judge/tabs/teams/hooks/mutations/useRemoveAthleteMutation';
import { useUpdateAthletePositionMutation } from '../../../judge/tabs/teams/hooks/mutations/useUpdateAthletePositionMutation';

export function useManagementTeamMutations(
  eventId: string | null,
  selectedModalityId: number | null,
  isOrganizer: boolean
) {
  const createTeamMutation = useCreateTeamMutation(eventId, selectedModalityId);
  const deleteTeamMutation = useDeleteTeamMutation(eventId, selectedModalityId);
  const addAthleteMutation = useAddAthleteMutation(eventId, selectedModalityId, isOrganizer);
  const removeAthleteMutation = useRemoveAthleteMutation(eventId, selectedModalityId, isOrganizer);
  const updateAthletePositionMutation = useUpdateAthletePositionMutation(eventId, selectedModalityId);

  return {
    createTeam: createTeamMutation.mutate,
    deleteTeam: deleteTeamMutation.mutate,
    addAthlete: ({ teamId, athleteId }: { teamId: number; athleteId: string }) => 
      addAthleteMutation.mutate({ teamId, athleteId }),
    removeAthlete: removeAthleteMutation.mutate,
    updateAthletePosition: updateAthletePositionMutation.mutate,
    isCreatingTeam: createTeamMutation.isPending,
    isDeletingTeam: deleteTeamMutation.isPending,
    isAddingAthlete: addAthleteMutation.isPending,
    isRemovingAthlete: removeAthleteMutation.isPending,
    isUpdatingAthlete: updateAthletePositionMutation.isPending
  };
}
