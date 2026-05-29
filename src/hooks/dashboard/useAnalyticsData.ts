
import { useQuery } from '@tanstack/react-query';
import { fetchBranchAnalytics } from '@/lib/api';
import { toast } from 'sonner';

export const useAnalyticsData = (eventId: string | null, filialIds?: string[]) => {
  const {
    data: branchAnalytics,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['branch-analytics', eventId, filialIds?.join(',') || 'all'],
    queryFn: async () => {
      try {
        console.log('Fetching branch analytics with eventId:', eventId, 'filialIds:', filialIds);

        if (!eventId) {
          console.warn('Event ID is required for analytics query');
          return [];
        }

        // Now fetch the analytics with the appropriate filter
        const result = await fetchBranchAnalytics(eventId, filialIds);
        return result;
      } catch (error) {
        console.error('Error in branch analytics query:', error);
        toast.error('Erro ao carregar dados estatísticos');
        return []; // Return empty array instead of throwing to prevent breaking the UI
      }
    },
    enabled: !!eventId,
    // Prevent showing stale data from other dashboard types
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });

  return {
    branchAnalytics: branchAnalytics || [],
    isLoading,
    error,
    refetch
  };
};
