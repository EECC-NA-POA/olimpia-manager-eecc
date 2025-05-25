
import React, { useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AthleteCard } from '@/components/judge/AthleteCard';
import { Athlete } from '../hooks/useAthletes';
import { AthleteFilters } from './AthleteFilters';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface AthletesListProps {
  athletes: Athlete[] | undefined;
  isLoading: boolean;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType?: 'time' | 'distance' | 'points';
}

interface AthleteWithBranchData extends Athlete {
  branchName?: string;
  branchState?: string;
}

export function AthletesList({ 
  athletes, 
  isLoading, 
  modalityId, 
  eventId, 
  judgeId, 
  scoreType 
}: AthletesListProps) {
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [filterType, setFilterType] = useState<'id' | 'name' | 'filial' | 'estado'>('name');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');

  // Fetch branch data for all athletes
  const { data: branchesData } = useQuery({
    queryKey: ['athletes-branches', athletes?.map(a => a.atleta_id)],
    queryFn: async () => {
      if (!athletes || athletes.length === 0) return {};
      
      console.log('Fetching branch data for athletes:', athletes.length);
      
      // Get user filial_ids for all athletes
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id, filial_id')
        .in('id', athletes.map(a => a.atleta_id));
      
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
    enabled: !!athletes && athletes.length > 0,
  });

  // Combine athletes with their branch data
  const athletesWithBranchData: AthleteWithBranchData[] = useMemo(() => {
    if (!athletes) return [];
    
    return athletes.map(athlete => ({
      ...athlete,
      branchName: branchesData?.[athlete.atleta_id]?.nome,
      branchState: branchesData?.[athlete.atleta_id]?.estado,
    }));
  }, [athletes, branchesData]);

  // Get unique branches and states for filter options
  const { availableBranches, availableStates } = useMemo(() => {
    const branches = new Map<string, string>();
    const states = new Set<string>();

    athletesWithBranchData.forEach(athlete => {
      if (athlete.branchName && athlete.branchState) {
        branches.set(athlete.branchName, athlete.branchState);
        states.add(athlete.branchState);
      }
    });

    return {
      availableBranches: Array.from(branches.entries()).map(([name, state]) => ({ name, state })),
      availableStates: Array.from(states).sort()
    };
  }, [athletesWithBranchData]);

  // Filter athletes based on search criteria
  const filteredAthletes = useMemo(() => {
    let filtered = athletesWithBranchData;

    // Apply text/select filters
    switch (filterType) {
      case 'id':
        if (searchFilter.trim()) {
          const searchTerm = searchFilter.toLowerCase().trim();
          filtered = filtered.filter(athlete => {
            const athleteId = athlete.atleta_id.slice(-6).toLowerCase();
            return athleteId.includes(searchTerm);
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

    return filtered;
  }, [athletesWithBranchData, searchFilter, filterType, selectedBranch, selectedState]);

  // Reset filters when filter type changes
  const handleFilterTypeChange = (newFilterType: 'id' | 'name' | 'filial' | 'estado') => {
    setFilterType(newFilterType);
    setSearchFilter('');
    setSelectedBranch('');
    setSelectedState('');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!athletesWithBranchData || athletesWithBranchData.length === 0) {
    return (
      <div className="space-y-4">
        <AthleteFilters
          searchFilter={searchFilter}
          onSearchFilterChange={setSearchFilter}
          filterType={filterType}
          onFilterTypeChange={handleFilterTypeChange}
          availableBranches={availableBranches}
          availableStates={availableStates}
          selectedBranch={selectedBranch}
          onSelectedBranchChange={setSelectedBranch}
          selectedState={selectedState}
          onSelectedStateChange={setSelectedState}
        />
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Nenhum atleta inscrito nesta modalidade
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AthleteFilters
        searchFilter={searchFilter}
        onSearchFilterChange={setSearchFilter}
        filterType={filterType}
        onFilterTypeChange={handleFilterTypeChange}
        availableBranches={availableBranches}
        availableStates={availableStates}
        selectedBranch={selectedBranch}
        onSelectedBranchChange={setSelectedBranch}
        selectedState={selectedState}
        onSelectedStateChange={setSelectedState}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAthletes.map((athlete) => (
          <AthleteCard
            key={athlete.atleta_id}
            athlete={athlete}
            isSelected={selectedAthleteId === athlete.atleta_id}
            onClick={() => setSelectedAthleteId(
              selectedAthleteId === athlete.atleta_id ? null : athlete.atleta_id
            )}
            modalityId={modalityId}
            scoreType={scoreType}
            eventId={eventId}
            judgeId={judgeId}
          />
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Mostrando {filteredAthletes.length} de {athletesWithBranchData?.length || 0} atletas
      </div>
    </div>
  );
}
