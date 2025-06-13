
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AthleteCard } from '@/components/judge/AthleteCard';
import { DynamicAthletesGrid } from './DynamicAthletesGrid';
import { AthleteFilters } from './AthleteFilters';
import { BateriaNavigationTabs } from './BateriaNavigationTabs';
import { BateriaAthleteSelector } from './BateriaAthleteSelector';
import { useAthletesFiltering } from './hooks/useAthletesFiltering';
import { useAthletesBranchData } from './hooks/useAthletesBranchData';
import { useAthletesScoreStatus } from './hooks/useAthletesScoreStatus';
import { useBateriaAthleteSelection } from '../hooks/useBateriaAthleteSelection';
import { useBateriaData } from '../hooks/useBateriaData';
import { useDynamicBaterias } from '../hooks/useDynamicBaterias';
import { useModeloConfiguration } from '../hooks/useModeloConfiguration';
import { useModelosModalidade } from '@/hooks/useDynamicScoring';
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
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Check for dynamic scoring
  const { data: modelos = [] } = useModelosModalidade(modalityId);
  const hasDynamicScoring = modelos.length > 0;

  // Get modelo configuration to check if it uses baterias
  const { data: modeloConfig } = useModeloConfiguration(modalityId);
  const usesBaterias = modeloConfig?.parametros?.baterias === true;

  // Bateria management - only if uses baterias
  const bateriasHook = useDynamicBaterias({ 
    modalityId, 
    eventId: eventId || ''
  });

  const {
    baterias,
    selectedBateriaId,
    selectedBateria,
    regularBaterias,
    finalBateria,
    hasFinalBateria,
    setSelectedBateriaId,
    createNewBateria,
    createFinalBateria,
    isCreating
  } = usesBaterias ? bateriasHook : {
    baterias: [],
    selectedBateriaId: null,
    selectedBateria: undefined,
    regularBaterias: [],
    finalBateria: undefined,
    hasFinalBateria: false,
    setSelectedBateriaId: () => {},
    createNewBateria: () => {},
    createFinalBateria: () => {},
    isCreating: false
  };

  // Bateria athlete selection
  const {
    selectedAthletes,
    selectedAthletesList,
    handleAthleteToggle,
    handleSelectAll,
    handleClearAll,
    getFilteredAthletes
  } = useBateriaAthleteSelection({
    athletes: athletes || [],
    selectedBateriaId
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

  // Fetch baterias data for legacy scoring
  const { data: bateriasData = [], isLoading: isLoadingBaterias } = useBateriaData(
    modalityId, 
    eventId
  );

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

  const showBateriaInfo = !hasDynamicScoring && modalityRule && (
    (modalityRule.regra_tipo === 'distancia' && modalityRule.parametros?.baterias) ||
    modalityRule.regra_tipo === 'baterias' ||
    modalityRule.regra_tipo === 'tempo'
  );

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

      <Card>
        <CardHeader className={isMobile ? 'pb-4' : ''}>
          <CardTitle className="text-base sm:text-lg">Atletas Inscritos</CardTitle>
          <div className="text-center text-xs sm:text-sm text-muted-foreground">
            Mostrando {athletesToShow.length} de {athletes.length} atletas
            {usesBaterias && selectedBateriaId && selectedAthletes.size > 0 && (
              <div className="mt-1 text-blue-700">
                ({selectedAthletes.size} selecionados para a bateria)
              </div>
            )}
            {hasDynamicScoring ? (
              <div className="mt-2 text-xs bg-green-50 text-green-700 p-2 rounded border">
                <strong>Sistema de Pontuação Dinâmica Ativo</strong>
                <div className="mt-1">
                  Modelo: {modelos[0]?.descricao || modelos[0]?.codigo_modelo}
                </div>
                <div className="mt-1">
                  {usesBaterias ? 'Sistema de baterias: Ativo' : 'Sistema de baterias: Inativo'}
                </div>
              </div>
            ) : modalityRule && (
              <div className="mt-2 text-xs bg-blue-50 text-blue-700 p-2 rounded border">
                Modalidade: {modalityRule.regra_tipo} 
                {modalityRule.parametros?.unidade && ` (${modalityRule.parametros.unidade})`}
                {showBateriaInfo && bateriasData.length > 0 && (
                  <div className="mt-1">
                    Baterias disponíveis: {bateriasData.map(b => `Bateria ${b.numero}`).join(', ')}
                  </div>
                )}
                {showBateriaInfo && bateriasData.length === 0 && (
                  <div className="mt-1 text-amber-600">
                    ⚠️ Nenhuma bateria configurada - configure nas regras da modalidade
                  </div>
                )}
              </div>
            )}
          </div>
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
