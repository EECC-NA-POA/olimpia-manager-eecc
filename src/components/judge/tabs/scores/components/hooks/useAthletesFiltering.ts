
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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
  athleteScores?: Record<string, boolean>;
  athletesBranchData: Array<{
    athleteId: string;
    athleteName: string;
    branchName: string;
    branchState: string;
  }>;
  availableBranches: Array<{ name: string; state: string }>;
  availableStates: string[];
  eventId?: string | null;
}

export function useAthletesFiltering({
  athletes,
  athleteScores = {},
  athletesBranchData,
  availableBranches,
  availableStates,
  eventId
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
  const athleteIds = safeAthletes.map(athlete => athlete.atleta_id);

  // Create a map for quick branch data lookup
  const branchDataMap = useMemo(() => {
    const map = new Map();
    athletesBranchData.forEach(data => {
      map.set(data.athleteId, data);
    });
    return map;
  }, [athletesBranchData]);

  // Fetch payment data for all athletes to get their numero_identificador
  const { data: paymentData } = useQuery({
    queryKey: ['athletes-payments-batch', athleteIds, eventId],
    queryFn: async () => {
      if (athleteIds.length === 0) return {};
      
      console.log('Fetching payment data for athletes to get identifiers');
      
      // Get payment data for all athletes
      const { data: payments, error } = await supabase
        .from('pagamentos')
        .select('atleta_id, numero_identificador, evento_id')
        .in('atleta_id', athleteIds);
      
      if (error) {
        console.error('Error fetching payment data:', error);
        return {};
      }
      
      // Create a mapping from athlete_id to numero_identificador
      const paymentMap: Record<string, string> = {};
      
      payments?.forEach(payment => {
        // Prefer payment for current event, fallback to any payment
        if (eventId && payment.evento_id === eventId) {
          paymentMap[payment.atleta_id] = payment.numero_identificador;
        } else if (!paymentMap[payment.atleta_id]) {
          paymentMap[payment.atleta_id] = payment.numero_identificador;
        }
      });
      
      console.log('Payment mapping created:', paymentMap);
      return paymentMap;
    },
    enabled: athleteIds.length > 0,
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
            const athleteId = paymentData?.[athlete.atleta_id] || athlete.atleta_id.slice(-6);
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
  }, [safeAthletes, filters, athleteScores, branchDataMap, paymentData]);

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
