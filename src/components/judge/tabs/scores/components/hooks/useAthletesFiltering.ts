
import { useState, useMemo } from 'react';
import { Athlete } from '../../hooks/useAthletes';

interface FilterState {
  searchFilter: string;
  filterType: 'id' | 'name' | 'filial' | 'estado';
  selectedBranch: string;
  selectedState: string;
}

export function useAthletesFiltering(athletes: Athlete[]) {
  const [filters, setFilters] = useState<FilterState>({
    searchFilter: '',
    filterType: 'name',
    selectedBranch: '',
    selectedState: ''
  });

  const filteredAthletes = useMemo(() => {
    let filtered = athletes;

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
    }

    return filtered;
  }, [athletes, filters]);

  const resetFilters = () => {
    setFilters({
      searchFilter: '',
      filterType: 'name',
      selectedBranch: '',
      selectedState: ''
    });
  };

  return {
    filteredAthletes,
    filters,
    setFilters,
    resetFilters
  };
}
