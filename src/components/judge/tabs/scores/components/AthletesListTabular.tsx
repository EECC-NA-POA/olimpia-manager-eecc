
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AthletesTable } from './AthletesTable';
import { DynamicAthletesTable } from './DynamicAthletesTable';
import { AthleteFilters } from './AthleteFilters';
import { BateriaNavigationTabs } from './BateriaNavigationTabs';
import { useAthletesFiltering } from './hooks/useAthletesFiltering';
import { useAthletesBranchData } from './hooks/useAthletesBranchData';
import { useAthletesScoreStatus } from './hooks/useAthletesScoreStatus';
import { useModelosModalidade } from '@/hooks/useDynamicScoring';
import { useDynamicBaterias } from '../hooks/useDynamicBaterias';
import { Athlete } from '../hooks/useAthletes';

interface AthletesListTabularProps {
  athletes: Athlete[] | undefined;
  isLoading: boolean;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType?: 'tempo' | 'distancia' | 'pontos';
  modalityRule?: any;
}

export function AthletesListTabular({
  athletes,
  isLoading,
  modalityId,
  eventId,
  judgeId,
  scoreType = 'pontos',
  modalityRule
}: AthletesListTabularProps) {
  // Check for dynamic scoring
  const { data: modelos = [], isLoading: isLoadingModelos } = useModelosModalidade(modalityId);
  const hasDynamicScoring = modelos.length > 0;

  // Bateria management
  const {
    baterias,
    selectedBateriaId,
    selectedBateria,
    regularBaterias,
    finalBateria,
    hasFinalBateria,
    usesBaterias,
    setSelectedBateriaId,
    createNewBateria,
    createFinalBateria,
    editBateria,
    isCreating,
    isEditing
  } = useDynamicBaterias({ modalityId, eventId: eventId || '', modalityRule });

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

  if (isLoading || isLoadingModelos) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando atletas...</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
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

  return (
    <div className="space-y-6">
      {/* Bateria Navigation - only show if modality uses baterias */}
      {usesBaterias && (
        <BateriaNavigationTabs
          regularBaterias={regularBaterias}
          finalBateria={finalBateria}
          selectedBateriaId={selectedBateriaId}
          onSelectBateria={setSelectedBateriaId}
          onCreateNewBateria={createNewBateria}
          onCreateFinalBateria={createFinalBateria}
          onEditBateria={editBateria}
          hasFinalBateria={hasFinalBateria}
          isCreating={isCreating}
          isEditing={isEditing}
          usesBaterias={usesBaterias}
        />
      )}

      {/* Athletes Scoring Section */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Pontuações - Modalidade</CardTitle>
          <div className="text-center text-sm text-muted-foreground">
            Mostrando {filteredAthletes.length} de {athletes.length} atletas
            {hasDynamicScoring && (
              <div className="mt-2 text-xs bg-green-50 text-green-700 p-2 rounded border">
                <strong>Sistema de Pontuação Dinâmica Ativo</strong>
                <div className="mt-1">
                  Modelo: {modelos[0]?.descricao || modelos[0]?.codigo_modelo}
                </div>
              </div>
            )}
            {selectedBateria && (
              <div className="mt-2 text-xs bg-blue-50 text-blue-700 p-2 rounded border">
                <strong>
                  {selectedBateria.isFinal ? 'Bateria Final' : `Bateria ${selectedBateria.numero}`} Selecionada
                </strong>
                <div className="mt-1">
                  {selectedBateria.isFinal 
                    ? 'Determine os ganhadores finais desta modalidade'
                    : 'Registre as pontuações para esta bateria'
                  }
                </div>
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
          
          {hasDynamicScoring ? (
            <DynamicAthletesTable
              athletes={filteredAthletes}
              modalityId={modalityId}
              eventId={eventId}
              judgeId={judgeId}
              modelo={modelos[0]}
              modalityRule={modalityRule}
            />
          ) : (
            <AthletesTable
              athletes={filteredAthletes}
              modalityId={modalityId}
              eventId={eventId}
              judgeId={judgeId}
              scoreType={scoreType}
              modalityRule={modalityRule}
              selectedBateriaId={selectedBateriaId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
