import { useQuery } from '@tanstack/react-query';
import { fetchBranchAnalytics, BranchAnalytics } from '@/lib/api';

export const useAnalyticsData = (eventId: string | null, filterByBranch: boolean = false) => {
  const { 
    data: branchAnalytics, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['branch-analytics', eventId, filterByBranch],
    queryFn: () => {
      console.log('Fetching analytics data including dependents for event:', eventId);
      return fetchBranchAnalytics(eventId, filterByBranch);
    },
    enabled: !!eventId,
    retry: 1,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching analytics:', error);
      }
    }
  });

  console.log('Analytics data loaded (should include dependents):', branchAnalytics);
  console.log('Total analytics records:', branchAnalytics?.length || 0);

  // Log detailed information about the analytics data
  if (branchAnalytics && branchAnalytics.length > 0) {
    branchAnalytics.forEach((branch, index) => {
      console.log(`Branch ${index + 1} - ${branch.filial}:`, {
        total_inscritos_geral: branch.total_inscritos_geral,
        total_inscritos_modalidades: branch.total_inscritos_modalidades,
        total_inscritos_por_status: branch.total_inscritos_por_status
      });
    });
    
    const totalFromAnalytics = branchAnalytics.reduce((sum, branch) => 
      sum + (Number(branch.total_inscritos_geral) || 0), 0
    );
    console.log('Total calculated from analytics (including dependents):', totalFromAnalytics);
  }

  return {
    branchAnalytics,
    isLoading,
    error,
    refetch
  };
};
