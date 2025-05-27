
import { useState, useMemo } from 'react';
import { Athlete } from '../../hooks/useAthletes';

interface FilterState {
  searchFilter: string;
  filterType: 'id' | 'name' | 'filial' | 'estado';
  selectedBranch: string;
  selectedState: string;
  statusFilter: 'all' | 'avaliado' | 'pendente';
}

interface UseAthletesFilteringProps {
  athletes: Athlete[];
  athleteScores?: Record<string, boolean>; // Map of athleteId -> hasScore
}

export function useAthletesFiltering(athletes: Athlete[], athleteScores: Record<string, boolean> = {}) {
  const [filters, setFilters] = useState<FilterState>({
    searchFilter: '',
    filterType: 'name',
    selectedBranch: '',
    selectedState: '',
    statusFilter: 'all'
  });

  // Extract unique branches and states from athletes
  const { availableBranches, availableStates } = useMemo(() => {
    const branchesSet = new Set<string>();
    const statesSet = new Set<string>();
    
    athletes.forEach(athlete => {
      // Note: We'll need to get branch data from the athlete card data hook
      // For now, we'll use placeholder logic
    });

    return {
      availableBranches: Array.from(branchesSet).map(name => ({ name, state: '' })),
      availableStates: Array.from(statesSet)
    };
  }, [athletes]);

  const filteredAthletes = useMemo(() => {
    let filtered = athletes;

    // Apply status filter first
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(athlete => {
        const hasScore = athleteScores[athlete.atleta_id] || false;
        return filters.statusFilter === 'avaliado' ? hasScore : !hasScore;
      });
    }

    // Apply text/select filters based on filter type
    switch (filters.filterType) {
      case 'id':
        if (filters.searchFilter.trim()) {
          const searchTerm = filters.searchFilter.toLowerCase().trim();
          filtered = filtered.filter(athlete => 
            athlete.atleta_id.toLowerCase().includes(searchTerm)
          );
        }
        break;
      
      case 'name':
        if (filters.searchFilter.trim()) {
          const searchTerm = filters.searchFilter.toLowerCase().trim();
          filtered = filtered.filter(athlete => 
            athlete.atleta_nome.toLowerCase().includes(searchTerm)
          );
        }
        break;
      
      case 'filial':
        if (filters.selectedBranch) {
          // This will need to be implemented with actual branch data
          // For now, we'll just filter by the search term if provided
          if (filters.searchFilter.trim()) {
            const searchTerm = filters.searchFilter.toLowerCase().trim();
            filtered = filtered.filter(athlete => 
              athlete.atleta_nome.toLowerCase().includes(searchTerm)
            );
          }
        }
        break;
      
      case 'estado':
        if (filters.selectedState) {
          // This will need to be implemented with actual state data
          // For now, we'll just filter by the search term if provided
          if (filters.searchFilter.trim()) {
            const searchTerm = filters.searchFilter.toLowerCase().trim();
            filtered = filtered.filter(athlete => 
              athlete.atleta_nome.toLowerCase().includes(searchTerm)
            );
          }
        }
        break;
    }

    return filtered;
  }, [athletes, filters, athleteScores]);

  const resetFilters = () => {
    setFilters({
      searchFilter: '',
      filterType: 'name',
      selectedBranch: '',
      selectedState: '',
      statusFilter: 'all'
    });
  };

  return {
    filteredAthletes,
    filters,
    setFilters,
    resetFilters,
    availableBranches,
    availableStates
  };
}
