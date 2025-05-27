
import { useMemo } from 'react';
import { useAthleteBranchData } from '../../../../hooks/useAthleteData';
import { Athlete } from '../../hooks/useAthletes';

export function useAthletesBranchData(athletes: Athlete[]) {
  // Get branch data for all athletes by calling the hook for each athlete
  const athletesBranchQueries = athletes.map(athlete => 
    useAthleteBranchData(athlete.atleta_id)
  );

  // Extract unique branches and states from actual data
  const { availableBranches, availableStates } = useMemo(() => {
    const branchesMap = new Map<string, string>(); // name -> state
    const statesSet = new Set<string>();

    athletesBranchQueries.forEach(query => {
      if (query.data) {
        const branchName = query.data.nome;
        const branchState = query.data.estado;
        
        if (branchName && branchState) {
          branchesMap.set(branchName, branchState);
          statesSet.add(branchState);
        }
      }
    });

    return {
      availableBranches: Array.from(branchesMap.entries()).map(([name, state]) => ({ name, state })),
      availableStates: Array.from(statesSet).sort()
    };
  }, [athletesBranchQueries]);

  // Create athlete data with branch information
  const athletesBranchData = useMemo(() => {
    return athletes.map((athlete, index) => {
      const branchData = athletesBranchQueries[index]?.data;
      return {
        athleteId: athlete.atleta_id,
        athleteName: athlete.atleta_nome,
        branchName: branchData?.nome || '',
        branchState: branchData?.estado || ''
      };
    });
  }, [athletes, athletesBranchQueries]);

  return {
    availableBranches,
    availableStates,
    athletesBranchData
  };
}
