
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AthleteFilters } from './AthleteFilters';
import { DynamicScoringTable } from './DynamicScoringTable';
import { AthletesTable } from './AthletesTable';
import { TabularStatusInfo } from './TabularStatusInfo';
import { Athlete } from '../hooks/useAthletes';
import { useIsMobile } from '@/hooks/use-mobile';

interface TabularContentSectionProps {
  athletesToShow: Athlete[];
  totalAthletes: number;
  usesBaterias: boolean;
  selectedBateriaId: number | null;
  selectedAthletesCount: number;
  hasDynamicScoring: boolean;
  modelos: any[];
  selectedBateria: any;
  filters: any;
  setFilters: (filters: any) => void;
  availableBranches: any[];
  availableStates: string[];
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType: 'tempo' | 'distancia' | 'pontos';
}

export function TabularContentSection({
  athletesToShow,
  totalAthletes,
  usesBaterias,
  selectedBateriaId,
  selectedAthletesCount,
  hasDynamicScoring,
  modelos,
  selectedBateria,
  filters,
  setFilters,
  availableBranches,
  availableStates,
  modalityId,
  eventId,
  judgeId,
  scoreType
}: TabularContentSectionProps) {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader className={isMobile ? 'pb-4' : ''}>
        <CardTitle className="text-base sm:text-lg">Registro de Pontuações - Modalidade</CardTitle>
        <TabularStatusInfo
          athletesToShow={athletesToShow}
          totalAthletes={totalAthletes}
          usesBaterias={usesBaterias}
          selectedBateriaId={selectedBateriaId}
          selectedAthletesCount={selectedAthletesCount}
          hasDynamicScoring={hasDynamicScoring}
          modelos={modelos}
          selectedBateria={selectedBateria}
        />
      </CardHeader>
      <CardContent className={`space-y-4 ${isMobile ? 'p-3 space-y-4' : 'space-y-6'}`}>
        <AthleteFilters
          searchFilter={filters.searchFilter}
          onSearchFilterChange={(value) => setFilters({ ...filters, searchFilter: value })}
          filterType={filters.filterType}
          onFilterTypeChange={(value) => setFilters({ ...filters, filterType: value })}
          availableBranches={availableBranches.map(branch => branch.name)}
          availableStates={availableStates}
          selectedBranch={filters.selectedBranch}
          onSelectedBranchChange={(value) => setFilters({ ...filters, selectedBranch: value })}
          selectedState={filters.selectedState}
          onSelectedStateChange={(value) => setFilters({ ...filters, selectedState: value })}
          statusFilter={filters.statusFilter}
          onStatusFilterChange={(value) => setFilters({ ...filters, statusFilter: value })}
        />
        
        <div className={isMobile ? 'overflow-x-auto -mx-3' : ''}>
          {hasDynamicScoring && modelos[0] && eventId ? (
            <DynamicScoringTable
              athletes={athletesToShow}
              modalityId={modalityId}
              eventId={eventId}
              judgeId={judgeId}
              modelo={modelos[0]}
              selectedBateriaId={selectedBateriaId}
            />
          ) : (
            <AthletesTable
              athletes={athletesToShow}
              modalityId={modalityId}
              eventId={eventId}
              judgeId={judgeId}
              scoreType={scoreType}
              selectedBateriaId={selectedBateriaId}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
