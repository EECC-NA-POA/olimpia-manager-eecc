
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BateriaNavigationTabs } from './BateriaNavigationTabs';
import { BateriaAthleteSelector } from './BateriaAthleteSelector';
import { TabularContentSection } from './TabularContentSection';
import { useAthletesListTabularLogic } from './hooks/useAthletesListTabularLogic';
import { Athlete } from '../hooks/useAthletes';
import { useIsMobile } from '@/hooks/use-mobile';

interface AthletesListTabularProps {
  athletes: Athlete[] | undefined;
  isLoading: boolean;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType?: 'tempo' | 'distancia' | 'pontos';
}

export function AthletesListTabular({
  athletes,
  isLoading,
  modalityId,
  eventId,
  judgeId,
  scoreType = 'pontos'
}: AthletesListTabularProps) {
  const isMobile = useIsMobile();

  // Use the extracted logic hook
  const {
    modelos,
    isLoadingModelos,
    isLoadingConfig,
    hasDynamicScoring,
    usesBaterias,
    selectedBateriaId,
    selectedBateria,
    regularBaterias,
    finalBateria,
    hasFinalBateria,
    setSelectedBateriaId,
    createNewBateria,
    createFinalBateria,
    isCreating,
    selectedAthletes,
    handleAthleteToggle,
    handleSelectAll,
    handleClearAll,
    availableBranches,
    availableStates,
    filters,
    setFilters,
    athletesToShow
  } = useAthletesListTabularLogic({
    athletes,
    modalityId,
    eventId
  });

  if (isLoading || isLoadingModelos || isLoadingConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Carregando atletas...</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 sm:h-64 w-full" />
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
      {/* Bateria Navigation - only show if modality uses baterias */}
      {usesBaterias && (
        <BateriaNavigationTabs
          regularBaterias={regularBaterias}
          finalBateria={finalBateria}
          selectedBateriaId={selectedBateriaId}
          onSelectBateria={setSelectedBateriaId}
          onCreateNewBateria={createNewBateria}
          onCreateFinalBateria={createFinalBateria}
          hasFinalBateria={hasFinalBateria}
          isCreating={isCreating}
          usesBaterias={usesBaterias}
        />
      )}

      {/* Bateria Athlete Selector - only show if modality uses baterias */}
      {usesBaterias && eventId && (
        <BateriaAthleteSelector
          athletes={athletes}
          selectedBateriaId={selectedBateriaId}
          selectedAthletes={selectedAthletes}
          onAthleteToggle={handleAthleteToggle}
          onSelectAll={handleSelectAll}
          onClearAll={handleClearAll}
        />
      )}

      {/* Athletes Scoring Section */}
      <TabularContentSection
        athletesToShow={athletesToShow}
        totalAthletes={athletes.length}
        usesBaterias={usesBaterias}
        selectedBateriaId={selectedBateriaId}
        selectedAthletesCount={selectedAthletes.size}
        hasDynamicScoring={hasDynamicScoring}
        modelos={modelos}
        selectedBateria={selectedBateria}
        filters={filters}
        setFilters={setFilters}
        availableBranches={availableBranches}
        availableStates={availableStates}
        modalityId={modalityId}
        eventId={eventId}
        judgeId={judgeId}
        scoreType={scoreType}
      />
    </div>
  );
}
