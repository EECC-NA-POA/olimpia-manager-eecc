
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAthleteData } from './dashboard/useAthleteData';
import { useBranchData } from './dashboard/useBranchData';
import { useAnalyticsData } from './dashboard/useAnalyticsData';
import { useEnrollmentData } from './dashboard/useEnrollmentData';

export const useDashboardData = (eventId: string | null, filialIds?: string[]) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Get athlete management data
  const {
    athletes,
    isLoading: isLoadingAthletes,
    error: athletesError,
    refetch: refetchAthletes
  } = useAthleteData(eventId, filialIds);

  // Get branch data for filtering and display
  const {
    branches,
    isLoading: isLoadingBranches,
    error: branchesError
  } = useBranchData();

  // Get analytics data
  const {
    branchAnalytics,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
    refetch: refetchAnalytics
  } = useAnalyticsData(eventId, filialIds);

  // Get enrollment data
  const {
    confirmedEnrollments,
    isLoading: isLoadingEnrollments,
    error: enrollmentsError,
    refetch: refetchEnrollments
  } = useEnrollmentData(eventId, filialIds);

  // Handle data refresh — invalidate all queries so every mounted component refetches
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    athletes: athletes || [],
    branches: branches || [],
    branchAnalytics: branchAnalytics || [],
    confirmedEnrollments: confirmedEnrollments || [],
    isLoading: {
      athletes: isLoadingAthletes,
      branches: isLoadingBranches,
      analytics: isLoadingAnalytics,
      enrollments: isLoadingEnrollments,
      any: isLoadingAthletes || isLoadingBranches || isLoadingAnalytics || isLoadingEnrollments
    },
    error: {
      athletes: athletesError,
      branches: branchesError,
      analytics: analyticsError,
      enrollments: enrollmentsError,
      any: athletesError || branchesError || analyticsError || enrollmentsError
    },
    isRefreshing,
    handleRefresh
  };
};
