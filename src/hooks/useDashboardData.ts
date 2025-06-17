
import { useState } from 'react';
import { useAthleteData } from './dashboard/useAthleteData';
import { useBranchData } from './dashboard/useBranchData';
import { useAnalyticsData } from './dashboard/useAnalyticsData';
import { useEnrollmentData } from './dashboard/useEnrollmentData';

export const useDashboardData = (eventId: string | null, filterByBranch: boolean = false) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get athlete management data (including dependents)
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

  // Get analytics data (including dependents)
  const { 
    branchAnalytics, 
    isLoading: isLoadingAnalytics, 
    error: analyticsError, 
    refetch: refetchAnalytics 
  } = useAnalyticsData(eventId, filterByBranch);

  // Get enrollment data (including dependents)
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
      console.log('Refreshing all dashboard data including dependents...');
      await Promise.all([
        refetchAthletes(),
        refetchAnalytics(),
        refetchEnrollments()
      ]);
      console.log('Dashboard data refresh completed');
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  console.log('Dashboard data summary (including dependents):', {
    athletes: athletes?.length || 0,
    branches: branches?.length || 0,
    branchAnalytics: branchAnalytics?.length || 0,
    confirmedEnrollments: confirmedEnrollments?.length || 0
  });

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
