
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AthleteCard } from '@/components/judge/AthleteCard';
import { DynamicAthletesGrid } from './DynamicAthletesGrid';
import { AthleteFilters } from './AthleteFilters';
import { useAthletesFiltering } from './hooks/useAthletesFiltering';
import { useAthletesBranchData } from './hooks/useAthletesBranchData';
import { useAthletesScoreStatus } from './hooks/useAthletesScoreStatus';
import { useBateriaData } from '../hooks/useBateriaData';
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

  // Fetch baterias data for this modality (for legacy scoring)
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
    <Card>
      <CardHeader className={isMobile ? 'pb-4' : ''}>
        <CardTitle className="text-base sm:text-lg">Atletas Inscritos</CardTitle>
        <div className="text-center text-xs sm:text-sm text-muted-foreground">
          Mostrando {filteredAthletes.length} de {athletes.length} atletas
          {hasDynamicScoring ? (
            <div className="mt-2 text-xs bg-green-50 text-green-700 p-2 rounded border">
              <strong>Sistema de Pontuação Dinâmica Ativo</strong>
              <div className="mt-1">
                Modelo: {modelos[0]?.descricao || modelos[0]?.codigo_modelo}
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
          availableBranches={availableBranches}
          availableStates={availableStates}
          selectedBranch={filters.selectedBranch}
          onSelectedBranchChange={(value) => setFilters({ ...filters, selectedBranch: value })}
          selectedState={filters.selectedState}
          onSelectedStateChange={(value) => setFilters({ ...filters, selectedState: value })}
          statusFilter={filters.statusFilter}
          onStatusFilterChange={(value) => setFilters({ ...filters, statusFilter: value })}
        />
        
        <DynamicAthletesGrid
          athletes={filteredAthletes}
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
  );
}
