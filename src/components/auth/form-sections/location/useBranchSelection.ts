
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
    queryFn: fetchBranchesByState,
    retry: 3,
    retryDelay: 1000,
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: false
  });

  // Process branch data and set states list and branches map
  useEffect(() => {
    if (branchesByState && branchesByState.length > 0) {
      console.log('Setting states from data:', branchesByState.length, 'state groups');
      // Extract states list
      const states = branchesByState.map(group => group.estado);
      setStatesList(states);
      
      // Create a map of state -> branches
      const branchMap: Record<string, any[]> = {};
      branchesByState.forEach(group => {
        branchMap[group.estado] = group.branches;
      });
      setBranchesMap(branchMap);
    } else {
      console.log('No branches by state data available');
      setStatesList([]);
      setBranchesMap({});
    }
  }, [branchesByState]);

  // Get branches for the selected state
  const branchesForSelectedState = selectedState && branchesMap[selectedState] 
    ? branchesMap[selectedState] 
    : [];

  const handleStateChange = (state: string) => {
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
