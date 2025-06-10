
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Athlete } from '../../hooks/useAthletes';

export function useAthletesBranchData(athletes: Athlete[]) {
  // Ensure athletes is always an array to prevent hook dependency issues
  const safeAthletes = athletes || [];
  const athleteIds = safeAthletes.map(athlete => athlete.atleta_id);

  // Fetch branch data for all athletes in one query instead of multiple hook calls
  const { data: branchesData } = useQuery({
    queryKey: ['athletes-branches-batch', athleteIds],
    queryFn: async () => {
      if (athleteIds.length === 0) return {};
      
      console.log('Fetching branch data for athletes:', athleteIds.length);
      
      // Get user filial_ids for all athletes
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id, filial_id')
        .in('id', athleteIds);
      
      if (userError || !userData) {
        console.error('Error fetching user filial data:', userError);
        return {};
      }
      
      // Get unique filial_ids
      const filialIds = [...new Set(userData.map(u => u.filial_id).filter(Boolean))];
      
      if (filialIds.length === 0) return {};
      
      // Get branch details
      const { data: branchData, error: branchError } = await supabase
        .from('filiais')
        .select('id, nome, estado')
        .in('id', filialIds);
      
      if (branchError || !branchData) {
        console.error('Error fetching branch data:', branchError);
        return {};
      }
      
      // Create a mapping from athlete_id to branch data
      const branchMap: Record<string, { nome: string; estado: string }> = {};
      
      userData.forEach(user => {
        if (user.filial_id) {
          const branch = branchData.find(b => b.id === user.filial_id);
          if (branch) {
            branchMap[user.id] = {
              nome: branch.nome,
              estado: branch.estado
            };
          }
        }
      });
      
      console.log('Branch mapping created:', branchMap);
      return branchMap;
    },
    enabled: athleteIds.length > 0,
  });

  // Extract unique branches and states from the batch data
  const { availableBranches, availableStates } = useMemo(() => {
    const branchesMap = new Map<string, string>(); // name -> state
    const statesSet = new Set<string>();

    if (branchesData) {
      Object.values(branchesData).forEach(branch => {
        if (branch?.nome && branch?.estado) {
          branchesMap.set(branch.nome, branch.estado);
          statesSet.add(branch.estado);
        }
      });
    }

    return {
      availableBranches: Array.from(branchesMap.entries()).map(([name, state]) => ({ name, state })),
      availableStates: Array.from(statesSet).sort()
    };
  }, [branchesData]);

  // Create athlete data with branch information
  const athletesBranchData = useMemo(() => {
    return safeAthletes.map((athlete) => {
      const branchData = branchesData?.[athlete.atleta_id];
      return {
        athleteId: athlete.atleta_id,
        athleteName: athlete.atleta_nome,
        branchName: branchData?.nome || '',
        branchState: branchData?.estado || ''
      };
    });
  }, [safeAthletes, branchesData]);

  return {
    availableBranches,
    availableStates,
    athletesBranchData
  };
}
