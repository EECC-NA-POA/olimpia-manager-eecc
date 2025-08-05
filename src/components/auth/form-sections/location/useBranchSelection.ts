
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBranchesByState } from '@/lib/api';
import { toast } from "sonner";

export interface StateWithBranches {
  estado: string;
  branches: any[];
}

export const useBranchSelection = (context: string = 'default') => {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [statesList, setStatesList] = useState<string[]>([]);
  const [branchesMap, setBranchesMap] = useState<Record<string, any[]>>({});

  // Memoize query key with context to prevent conflicts between different instances
  const queryKey = useMemo(() => ['branches-by-state', context], [context]);

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
      console.log(`🚀 Starting fetchBranchesByState query for context: ${context}...`);
      try {
        const result = await fetchBranchesByState();
        console.log(`🎯 Query completed successfully for context ${context}:`, {
          statesCount: result.length,
          totalBranches: result.reduce((sum, state) => sum + state.branches.length, 0),
          context
        });
        return result;
      } catch (error) {
        console.error(`💥 Query failed for context ${context}:`, error);
        
        // Additional debugging for admin context
        if (context === 'admin') {
          console.error('🔍 Admin context debugging:', {
            errorMessage: error.message,
            errorStack: error.stack,
            timestamp: new Date().toISOString()
          });
        }
        
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
    console.log(`🔄 Processing branches data for context ${context}:`, {
      hasData: !!branchesByState,
      dataLength: branchesByState?.length || 0,
      isSuccess,
      isError,
      isLoading,
      context
    });
    
    if (!branchesByState || branchesByState.length === 0) {
      console.log(`⚠️ No branches by state data available for context ${context}`);
      return {
        states: [],
        branchMap: {}
      };
    }

    // Extract states list
    const states = branchesByState.map(group => group.estado);
    console.log(`📋 States extracted for context ${context}:`, states);
    
    // Create a map of state -> branches
    const branchMap: Record<string, any[]> = {};
    branchesByState.forEach(group => {
      branchMap[group.estado] = group.branches;
    });
    console.log(`🗺️ Branch map created for context ${context}:`, Object.keys(branchMap));

    return { states, branchMap };
  }, [branchesByState, isSuccess, isError, isLoading]);

  // Update state lists when processed data changes
  useEffect(() => {
    console.log(`📝 Updating states and branches from processed data for context ${context}`);
    setStatesList(processedData.states);
    setBranchesMap(processedData.branchMap);
  }, [processedData, context]);

  // Log error details with more context
  useEffect(() => {
    if (error) {
      console.error(`❌ Branch selection error details for context ${context}:`, {
        message: error.message,
        stack: error.stack,
        name: error.name,
        isError,
        isLoading,
        dataReceived: branchesByState?.length || 0,
        context
      });
      
      // Show user-friendly error with context information
      toast.error('Erro ao carregar filiais', {
        description: context === 'admin' ? 'Erro no contexto administrativo. Verifique as permissões.' : 'Tentando reconectar...'
      });
    }
  }, [error, isError, isLoading, branchesByState]);

  // Get branches for the selected state (memoized)
  const branchesForSelectedState = useMemo(() => {
    if (!selectedState || !branchesMap[selectedState]) {
      console.log(`🔍 No branches for selected state in context ${context}:`, selectedState);
      return [];
    }
    
    const branches = branchesMap[selectedState];
    console.log(`🏢 Found ${branches.length} branches for state ${selectedState} in context ${context}`);
    return branches;
  }, [selectedState, branchesMap, context]);

  const handleStateChange = useCallback((state: string) => {
    console.log(`🌍 State selected in context ${context}:`, state);
    setSelectedState(state);
  }, [context]);

  // Enhanced retry function
  const handleRetry = useCallback(() => {
    console.log(`🔄 Manual retry requested for context ${context}`);
    refetch();
  }, [refetch, context]);

  // Log current state for debugging
  useEffect(() => {
    console.log(`📊 Current hook state for context ${context}:`, {
      isLoading,
      isError: !!error,
      statesCount: statesList.length,
      selectedState,
      branchesForSelectedStateCount: branchesForSelectedState.length,
      hasData: branchesByState.length > 0,
      context
    });
  }, [isLoading, error, statesList.length, selectedState, branchesForSelectedState.length, branchesByState.length, context]);

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
