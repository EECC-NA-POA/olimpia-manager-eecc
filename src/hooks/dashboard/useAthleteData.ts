
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
      console.log('useAthleteData query executing with:', { eventId, filterByBranch });
      return fetchAthleteManagement(filterByBranch, eventId);
    },
    enabled: !!eventId,
    retry: 1,
    staleTime: 0, // Force fresh data
    meta: {
      onError: (error: any) => {
        console.error('Error fetching athletes:', error);
      }
    }
  });

  console.log('useAthleteData result:', { 
    athletesCount: athletes?.length, 
    isLoading, 
    error: error?.message 
  });

  return {
    athletes,
    isLoading,
    error,
    refetch
  };
};
