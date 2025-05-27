
import { useMemo } from 'react';
import { useAthleteBranchData } from '../../../../hooks/useAthleteData';
import { Athlete } from '../../hooks/useAthletes';

export function useAthletesBranchData(athletes: Athlete[]) {
  // Get branch data for all athletes
  const athletesBranchData = useMemo(() => {
    return athletes.map(athlete => ({
      athleteId: athlete.atleta_id,
      athleteName: athlete.atleta_nome
    }));
  }, [athletes]);

  // Extract unique branches and states
  const { availableBranches, availableStates } = useMemo(() => {
    const branchesMap = new Map<string, string>(); // name -> state
    const statesSet = new Set<string>();

    // For now, we'll use some mock data since we need to integrate with the actual branch data
    // This would normally come from the useAthleteBranchData hook for each athlete
    const mockBranches = [
      { name: 'Porto Alegre - Centro', state: 'RS' },
      { name: 'São Paulo - Centro', state: 'SP' },
      { name: 'Rio de Janeiro - Centro', state: 'RJ' }
    ];

    mockBranches.forEach(branch => {
      branchesMap.set(branch.name, branch.state);
      statesSet.add(branch.state);
    });

    return {
      availableBranches: Array.from(branchesMap.entries()).map(([name, state]) => ({ name, state })),
      availableStates: Array.from(statesSet)
    };
  }, []);

  return {
    availableBranches,
    availableStates,
    athletesBranchData
  };
}
