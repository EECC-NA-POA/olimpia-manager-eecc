
import { useState, useEffect } from 'react';
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

  const { 
    data: branchesByState = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['branches-by-state'],
    queryFn: async () => {
      console.log('Starting fetchBranchesByState query...');
      try {
        const result = await fetchBranchesByState();
        console.log('Query result:', result);
        return result;
      } catch (error) {
        console.error('Query error:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: false
  });

  // Process branch data and set states list and branches map
  useEffect(() => {
    console.log('Processing branches data:', branchesByState);
    
    if (branchesByState && branchesByState.length > 0) {
      console.log('Setting states from data:', branchesByState.length, 'state groups');
      // Extract states list
      const states = branchesByState.map(group => group.estado);
      console.log('States extracted:', states);
      setStatesList(states);
      
      // Create a map of state -> branches
      const branchMap: Record<string, any[]> = {};
      branchesByState.forEach(group => {
        branchMap[group.estado] = group.branches;
      });
      console.log('Branch map created:', branchMap);
      setBranchesMap(branchMap);
    } else {
      console.log('No branches by state data available');
      setStatesList([]);
      setBranchesMap({});
    }
  }, [branchesByState]);

  // Log error details
  useEffect(() => {
    if (error) {
      console.error('Branch selection error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
  }, [error]);

  // Get branches for the selected state
  const branchesForSelectedState = selectedState && branchesMap[selectedState] 
    ? branchesMap[selectedState] 
    : [];

  const handleStateChange = (state: string) => {
    console.log('State selected:', state);
    setSelectedState(state);
  };

  return {
    statesList,
    branchesForSelectedState,
    selectedState,
    handleStateChange,
    isLoading,
    error,
    refetch
  };
};
