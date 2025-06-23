
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DynamicAthletesGrid } from './DynamicAthletesGrid';
import { AthleteFilters } from './AthleteFilters';
import { BateriaControlsSection } from './BateriaControlsSection';
import { AthletesStatusInfo } from './AthletesStatusInfo';
import { useAthletesFiltering } from './hooks/useAthletesFiltering';
import { useAthletesBranchData } from './hooks/useAthletesBranchData';
import { useAthletesScoreStatus } from './hooks/useAthletesScoreStatus';
import { useAthletesListLogic } from './hooks/useAthletesListLogic';
import { Athlete } from '../hooks/useAthletes';
import { useIsMobile } from '@/hooks/use-mobile';

interface AthletesListProps {
  athletes: Athlete[] | undefined;
  isLoading: boolean;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType?: 'tempo' | 'distancia' | 'pontos';
  modalityRule?: any;
}

export function AthletesList({
  athletes,
  isLoading,
  modalityId,
  eventId,
  judgeId,
  scoreType = 'pontos',
  modalityRule
}: AthletesListProps) {
  const isMobile = useIsMobile();

  // Use the extracted logic hook
  const {
    selectedAthleteId,
    setSelectedAthleteId,
    hasDynamicScoring,
    modelos,
    usesBaterias,
    regularBaterias,
    finalBateria,
    selectedBateriaId,
    setSelectedBateriaId,
    createNewBateria,
    createFinalBateria,
    hasFinalBateria,
    isCreating,
    selectedAthletes,
    handleAthleteToggle,
    handleSelectAll,
    handleClearAll,
    getFilteredAthletes,
    bateriasData
  } = useAthletesListLogic({
    modalityId,
    eventId,
    athletes
  });

  // Get branch data for filtering
  const { availableBranches, availableStates, athletesBranchData } = useAthletesBranchData(athletes || []);

  // Get scores status for all athletes
  const athleteScores = useAthletesScoreStatus({
    athletes: athletes || [],
    modalityId,
    eventId
  });

  const {
    filteredAthletes,
    filters,
    setFilters,
    resetFilters
  } = useAthletesFiltering({
    athletes: athletes || [],
    athleteScores,
    athletesBranchData,
    availableBranches,
    availableStates,
    eventId
  });

  // Apply bateria filtering
  const athletesToShow = getFilteredAthletes(filteredAthletes);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Carregando atletas...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {[...Array(isMobile ? 3 : 6)].map((_, index) => (
              <Skeleton key={index} className="h-48 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!athletes || athletes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Nenhum atleta encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Não há atletas inscritos nesta modalidade.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
      {/* Bateria Controls Section */}
      <BateriaControlsSection
        usesBaterias={usesBaterias}
        eventId={eventId}
        regularBaterias={regularBaterias}
        finalBateria={finalBateria}
        selectedBateriaId={selectedBateriaId}
        onSelectBateria={setSelectedBateriaId}
        onCreateNewBateria={createNewBateria}
        onCreateFinalBateria={createFinalBateria}
        hasFinalBateria={hasFinalBateria}
        isCreating={isCreating}
        athletes={athletes}
        selectedAthletes={selectedAthletes}
        onAthleteToggle={handleAthleteToggle}
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
      />

      <Card>
        <CardHeader className={isMobile ? 'pb-4' : ''}>
          <CardTitle className="text-base sm:text-lg">Atletas Inscritos</CardTitle>
          <AthletesStatusInfo
            athletesToShow={athletesToShow.length}
            totalAthletes={athletes.length}
            usesBaterias={usesBaterias}
            selectedBateriaId={selectedBateriaId}
            selectedAthletesCount={selectedAthletes.size}
            hasDynamicScoring={hasDynamicScoring}
            modelos={modelos}
            modalityRule={modalityRule}
            bateriasData={bateriasData}
          />
        </CardHeader>
        <CardContent className={`space-y-4 ${isMobile ? 'p-3' : 'space-y-6'}`}>
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
          
          <DynamicAthletesGrid
            athletes={athletesToShow}
            selectedAthleteId={selectedAthleteId}
            onAthleteSelect={setSelectedAthleteId}
            modalityId={modalityId}
            scoreType={scoreType}
            eventId={eventId}
            judgeId={judgeId}
            modalityRule={modalityRule}
          />
        </CardContent>
      </Card>
    </div>
  );
}
