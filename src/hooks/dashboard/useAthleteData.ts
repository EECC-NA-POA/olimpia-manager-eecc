
import { useQuery } from '@tanstack/react-query';
import { fetchAthleteManagement } from '@/lib/api';

export const useAthleteData = (eventId: string | null, filterByBranch: boolean = false) => {
  const { 
    data: athletes, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['athlete-management', eventId, filterByBranch],
    queryFn: () => {
      console.log('Fetching athlete data including dependents for event:', eventId);
      return fetchAthleteManagement(filterByBranch, eventId);
    },
    enabled: !!eventId,
    retry: 1,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching athletes:', error);
      }
    }
  });

  console.log('Athletes data loaded (including dependents):', athletes?.length || 0);

  return {
    athletes,
    isLoading,
    error,
    refetch
  };
};
