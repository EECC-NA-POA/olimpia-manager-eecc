
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBranchesByState } from '@/lib/api';
import { toast } from "sonner";

export interface StateWithBranches {
  estado: string;
  branches: any[];
}

export const useBranchSelection = () => {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [statesList, setStatesList] = useState<string[]>([]);
  const [branchesMap, setBranchesMap] = useState<Record<string, any[]>>({});

  // Memoize query key to prevent unnecessary refetches
  const queryKey = useMemo(() => ['branches-by-state'], []);

  const { 
    data: branchesByState = [], 
    isLoading,
    error,
    refetch,
    isError,
    isSuccess
  } = useQuery({
    queryKey,
    queryFn: async () => {
      console.log('🚀 Starting fetchBranchesByState query...');
      try {
        const result = await fetchBranchesByState();
        console.log('🎯 Query completed successfully:', {
          statesCount: result.length,
          totalBranches: result.reduce((sum, state) => sum + state.branches.length, 0)
        });
        return result;
      } catch (error) {
        console.error('💥 Query failed:', error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      console.log(`🔄 Retry attempt ${failureCount} for error:`, error);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * Math.pow(2, attemptIndex), 30000);
      console.log(`⏱️ Retry delay: ${delay}ms`);
      return delay;
    },
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });

  // Memoize processed data to prevent unnecessary re-renders
  const processedData = useMemo(() => {
    console.log('🔄 Processing branches data:', {
      hasData: !!branchesByState,
      dataLength: branchesByState?.length || 0,
      isSuccess,
      isError,
      isLoading
    });
    
    if (!branchesByState || branchesByState.length === 0) {
      console.log('⚠️ No branches by state data available');
      return {
        states: [],
        branchMap: {}
      };
    }

    // Extract states list
    const states = branchesByState.map(group => group.estado);
    console.log('📋 States extracted:', states);
    
    // Create a map of state -> branches
    const branchMap: Record<string, any[]> = {};
    branchesByState.forEach(group => {
      branchMap[group.estado] = group.branches;
    });
    console.log('🗺️ Branch map created:', Object.keys(branchMap));

    return { states, branchMap };
  }, [branchesByState, isSuccess, isError, isLoading]);

  // Update state lists when processed data changes
  useEffect(() => {
    console.log('📝 Updating states and branches from processed data');
    setStatesList(processedData.states);
    setBranchesMap(processedData.branchMap);
  }, [processedData]);

  // Log error details with more context
  useEffect(() => {
    if (error) {
      console.error('❌ Branch selection error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        isError,
        isLoading,
        dataReceived: branchesByState?.length || 0
      });
      
      // Show user-friendly error
      toast.error('Erro ao carregar filiais', {
        description: 'Tentando reconectar...'
      });
    }
  }, [error, isError, isLoading, branchesByState]);

  // Get branches for the selected state (memoized)
  const branchesForSelectedState = useMemo(() => {
    if (!selectedState || !branchesMap[selectedState]) {
      console.log('🔍 No branches for selected state:', selectedState);
      return [];
    }
    
    const branches = branchesMap[selectedState];
    console.log(`🏢 Found ${branches.length} branches for state:`, selectedState);
    return branches;
  }, [selectedState, branchesMap]);

  const handleStateChange = useCallback((state: string) => {
    console.log('🌍 State selected:', state);
    setSelectedState(state);
  }, []);

  // Enhanced retry function
  const handleRetry = useCallback(() => {
    console.log('🔄 Manual retry requested');
    refetch();
  }, [refetch]);

  // Log current state for debugging
  useEffect(() => {
    console.log('📊 Current hook state:', {
      isLoading,
      isError: !!error,
      statesCount: statesList.length,
      selectedState,
      branchesForSelectedStateCount: branchesForSelectedState.length,
      hasData: branchesByState.length > 0
    });
  }, [isLoading, error, statesList.length, selectedState, branchesForSelectedState.length, branchesByState.length]);

  return {
    statesList,
    branchesForSelectedState,
    selectedState,
    handleStateChange,
    isLoading,
    error,
    refetch: handleRetry
  };
};
