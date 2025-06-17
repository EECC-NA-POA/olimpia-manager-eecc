
import { useState } from 'react';
import { useAthleteData } from './dashboard/useAthleteData';
import { useBranchData } from './dashboard/useBranchData';
import { useAnalyticsData } from './dashboard/useAnalyticsData';
import { useEnrollmentData } from './dashboard/useEnrollmentData';

export const useDashboardData = (eventId: string | null, filterByBranch: boolean = false) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get athlete management data
  const { 
    athletes, 
    isLoading: isLoadingAthletes, 
    error: athletesError, 
    refetch: refetchAthletes 
  } = useAthleteData(eventId, filterByBranch);

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
  } = useAnalyticsData(eventId, filterByBranch);

  // Get enrollment data
  const { 
    confirmedEnrollments, 
    isLoading: isLoadingEnrollments, 
    error: enrollmentsError, 
    refetch: refetchEnrollments 
  } = useEnrollmentData(eventId, filterByBranch);

  // Handle data refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchAthletes(),
        refetchAnalytics(),
        refetchEnrollments()
      ]);
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
