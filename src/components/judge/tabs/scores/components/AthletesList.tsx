
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AthleteCard } from '@/components/judge/AthleteCard';
import { AthletesGrid } from './AthletesGrid';
import { AthleteFilters } from './AthleteFilters';
import { useAthletesFiltering } from './hooks/useAthletesFiltering';
import { useAthletesBranchData } from './hooks/useAthletesBranchData';
import { useAthletesScoreStatus } from './hooks/useAthletesScoreStatus';
import { useBateriaData } from '../hooks/useBateriaData';
import { Athlete } from '../hooks/useAthletes';

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

  // Get branch data for filtering
  const { availableBranches, availableStates } = useAthletesBranchData(athletes || []);

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
  } = useAthletesFiltering(athletes || [], athleteScores);

  // Fetch baterias data for this modality
  const { data: bateriasData = [], isLoading: isLoadingBaterias } = useBateriaData(
    modalityId, 
    eventId
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando atletas...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
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
          <CardTitle>Nenhum atleta encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Não há atletas inscritos nesta modalidade.
          </p>
        </CardContent>
      </Card>
    );
  }

  const showBateriaInfo = modalityRule && (
    (modalityRule.regra_tipo === 'distancia' && modalityRule.parametros?.baterias) ||
    modalityRule.regra_tipo === 'baterias' ||
    modalityRule.regra_tipo === 'tempo'
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atletas Inscritos</CardTitle>
        <div className="text-center text-sm text-muted-foreground">
          Mostrando {filteredAthletes.length} de {athletes.length} atletas
          {modalityRule && (
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
      <CardContent className="space-y-6">
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
        
        <AthletesGrid
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
