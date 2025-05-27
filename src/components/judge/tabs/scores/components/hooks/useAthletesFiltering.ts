import { useState, useMemo } from 'react';
import { Athlete } from '../../hooks/useAthletes';
import { useAthletePaymentData } from '../../../../hooks/useAthleteData';

interface FilterState {
  searchFilter: string;
  filterType: 'id' | 'name' | 'filial' | 'estado';
  selectedBranch: string;
  selectedState: string;
  statusFilter: 'all' | 'avaliado' | 'pendente';
}

interface UseAthletesFilteringProps {
  athletes: Athlete[];
  athleteScores?: Record<string, boolean>;
  athletesBranchData: Array<{
    athleteId: string;
    athleteName: string;
    branchName: string;
    branchState: string;
  }>;
  availableBranches: Array<{ name: string; state: string }>;
  availableStates: string[];
}

export function useAthletesFiltering({
  athletes,
  athleteScores = {},
  athletesBranchData,
  availableBranches,
  availableStates
}: UseAthletesFilteringProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchFilter: '',
    filterType: 'name',
    selectedBranch: '',
    selectedState: '',
    statusFilter: 'all'
  });

  // Ensure we have a safe athletes array
  const safeAthletes = athletes || [];

  // Create a map for quick branch data lookup
  const branchDataMap = useMemo(() => {
    const map = new Map();
    athletesBranchData.forEach(data => {
      map.set(data.athleteId, data);
    });
    return map;
  }, [athletesBranchData]);

  // Get athlete payment data for ID filtering - only call hooks for existing athletes
  const athletesWithPaymentData = safeAthletes.map(athlete => {
    const paymentQuery = useAthletePaymentData(athlete.atleta_id, null);
    return {
      ...athlete,
      numero_identificador: paymentQuery.data?.numero_identificador || ''
    };
  });

  const filteredAthletes = useMemo(() => {
    let filtered = safeAthletes;

    console.log('=== FILTER DEBUG ===');
    console.log('Filter type:', filters.filterType);
    console.log('Search filter:', filters.searchFilter);
    console.log('Selected branch:', filters.selectedBranch);
    console.log('Selected state:', filters.selectedState);
    console.log('Status filter:', filters.statusFilter);
    console.log('Total athletes:', filtered.length);

    // Apply status filter first
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(athlete => {
        const hasScore = athleteScores[athlete.atleta_id] || false;
        return filters.statusFilter === 'avaliado' ? hasScore : !hasScore;
      });
      console.log('After status filter:', filtered.length);
    }

    // Apply text/select filters based on filter type
    switch (filters.filterType) {
      case 'id':
        if (filters.searchFilter.trim()) {
          const searchTerm = filters.searchFilter.toLowerCase().trim();
          console.log('Filtering by ID with term:', searchTerm);
          
          filtered = filtered.filter(athlete => {
            const athleteWithPayment = athletesWithPaymentData.find(a => a.atleta_id === athlete.atleta_id);
            const athleteId = athleteWithPayment?.numero_identificador || '';
            const matches = athleteId.toLowerCase().includes(searchTerm);
            
            console.log('Athlete:', athlete.atleta_nome, 'ID:', athleteId, 'Matches:', matches);
            return matches;
          });
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
          filtered = filtered.filter(athlete => {
            const branchData = branchDataMap.get(athlete.atleta_id);
            return branchData?.branchName === filters.selectedBranch;
          });
        }
        break;
      
      case 'estado':
        if (filters.selectedState) {
          filtered = filtered.filter(athlete => {
            const branchData = branchDataMap.get(athlete.atleta_id);
            return branchData?.branchState === filters.selectedState;
          });
        }
        break;
    }

    console.log('Filtered athletes count:', filtered.length);
    console.log('=== END FILTER DEBUG ===');

    return filtered;
  }, [safeAthletes, filters, athleteScores, branchDataMap, athletesWithPaymentData]);

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
    resetFilters
  };
}
