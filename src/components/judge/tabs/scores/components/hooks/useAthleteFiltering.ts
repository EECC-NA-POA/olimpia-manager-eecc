
import { useMemo } from 'react';
import { AthleteWithBranchData } from '../types';

interface UseAthleteFilteringProps {
  athletes: AthleteWithBranchData[];
  searchFilter: string;
  filterType: 'id' | 'name' | 'filial' | 'estado';
  selectedBranch: string;
  selectedState: string;
}

export function useAthleteFiltering({
  athletes,
  searchFilter,
  filterType,
  selectedBranch,
  selectedState
}: UseAthleteFilteringProps) {
  return useMemo(() => {
    let filtered = athletes;

    console.log('=== FILTER DEBUG ===');
    console.log('Filter type:', filterType);
    console.log('Search filter:', searchFilter);
    console.log('Total athletes:', filtered.length);

    // Apply text/select filters
    switch (filterType) {
      case 'id':
        if (searchFilter.trim()) {
          const searchTerm = searchFilter.toLowerCase().trim();
          console.log('Filtering by ID with term:', searchTerm);
          
          filtered = filtered.filter(athlete => {
            const athleteId = athlete.numero_identificador;
            const matches = athleteId.toLowerCase().includes(searchTerm);
            
            console.log('Athlete:', athlete.atleta_nome, 'ID:', athleteId, 'Matches:', matches);
            return matches;
          });
        }
        break;
      
      case 'name':
        if (searchFilter.trim()) {
          const searchTerm = searchFilter.toLowerCase().trim();
          filtered = filtered.filter(athlete => 
            athlete.atleta_nome.toLowerCase().includes(searchTerm)
          );
        }
        break;
      
      case 'filial':
        if (selectedBranch) {
          filtered = filtered.filter(athlete => 
            athlete.branchName === selectedBranch
          );
        }
        break;
      
      case 'estado':
        if (selectedState) {
          filtered = filtered.filter(athlete => 
            athlete.branchState === selectedState
          );
        }
        break;
    }

    console.log('Filtered athletes count:', filtered.length);
    console.log('=== END FILTER DEBUG ===');

    return filtered;
  }, [athletes, searchFilter, filterType, selectedBranch, selectedState]);
}
