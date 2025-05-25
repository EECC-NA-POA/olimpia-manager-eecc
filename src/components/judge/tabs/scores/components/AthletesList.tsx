
import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Athlete } from '../hooks/useAthletes';
import { AthleteFilters } from './AthleteFilters';
import { AthletesGrid } from './AthletesGrid';
import { AthletesCount } from './AthletesCount';
import { useAthleteData } from './hooks/useAthleteData';
import { useAthleteFiltering } from './hooks/useAthleteFiltering';

interface AthletesListProps {
  athletes: Athlete[] | undefined;
  isLoading: boolean;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType?: 'time' | 'distance' | 'points';
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

  // Get enhanced athlete data with branch information
  const { athletesWithBranchData, availableBranches, availableStates } = useAthleteData({
    athletes,
    eventId
  });

  // Filter athletes based on search criteria
  const filteredAthletes = useAthleteFiltering({
    athletes: athletesWithBranchData,
    searchFilter,
    filterType,
    selectedBranch,
    selectedState
  });

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
      
      <AthletesGrid
        athletes={filteredAthletes}
        selectedAthleteId={selectedAthleteId}
        onAthleteSelect={setSelectedAthleteId}
        modalityId={modalityId}
        scoreType={scoreType}
        eventId={eventId}
        judgeId={judgeId}
      />

      <AthletesCount 
        filteredCount={filteredAthletes.length}
        totalCount={athletesWithBranchData.length}
      />
    </div>
  );
}
