
import { useQuery } from '@tanstack/react-query';
import { fetchAthleteManagement } from '@/lib/api';

export const useAthleteData = (eventId: string | null, filialIds?: string[]) => {
  const {
    data: athletes,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['athlete-management', eventId, filialIds?.join(',') || 'all'],
    queryFn: () => {
      console.log('useAthleteData query executing with:', { eventId, filialIds });
      return fetchAthleteManagement(filialIds, eventId);
    },
    enabled: !!eventId,
    retry: 1,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
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
