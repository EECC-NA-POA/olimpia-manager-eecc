
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
    queryFn: () => fetchAthleteManagement(filterByBranch, eventId),
    enabled: !!eventId,
    retry: 1,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching athletes:', error);
      }
    }
  });

  return {
    athletes,
    isLoading,
    error,
    refetch
  };
};
