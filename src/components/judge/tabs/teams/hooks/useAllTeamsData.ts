
import { useTeamsQuery } from './useTeamsQuery';
import { useModalitiesQuery } from './useModalitiesQuery';
import { useBranchesQuery } from './useBranchesQuery';

export function useAllTeamsData(
  eventId: string | null,
  modalityFilter: number | null,
  branchFilter: string | null,
  searchTerm: string,
  userBranchId?: string
) {
  const teamsQuery = useTeamsQuery(eventId, modalityFilter, branchFilter, searchTerm);
  const modalitiesQuery = useModalitiesQuery(eventId);
  const branchesQuery = useBranchesQuery(eventId, userBranchId);

  return {
    teams: teamsQuery.data || [],
    modalities: modalitiesQuery.data || [],
    branches: branchesQuery.data || [],
    isLoading: teamsQuery.isLoading || modalitiesQuery.isLoading || branchesQuery.isLoading,
    error: teamsQuery.error || modalitiesQuery.error || branchesQuery.error
  };
}
