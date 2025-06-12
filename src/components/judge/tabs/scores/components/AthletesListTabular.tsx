
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AthletesTable } from './AthletesTable';
import { DynamicScoringTable } from './DynamicScoringTable';
import { AthleteFilters } from './AthleteFilters';
import { BateriaNavigationTabs } from './BateriaNavigationTabs';
import { useAthletesFiltering } from './hooks/useAthletesFiltering';
import { useAthletesBranchData } from './hooks/useAthletesBranchData';
import { useAthletesScoreStatus } from './hooks/useAthletesScoreStatus';
import { useModelosModalidade } from '@/hooks/useDynamicScoring';
import { useDynamicBaterias } from '../hooks/useDynamicBaterias';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Athlete } from '../hooks/useAthletes';
import { CampoModelo } from '@/types/dynamicScoring';
import { modelUsesBaterias } from '@/utils/dynamicScoringUtils';
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

  // Check for dynamic scoring
  const { data: modelos = [], isLoading: isLoadingModelos } = useModelosModalidade(modalityId);
  const hasDynamicScoring = modelos.length > 0;

  // Get campos for the modelo if it exists
  const { data: campos = [] } = useQuery({
    queryKey: ['campos-modelo', modelos[0]?.id],
    queryFn: async () => {
      if (!modelos[0]?.id) return [];
      
      const { data, error } = await supabase
        .from('campos_modelo')
        .select('*')
        .eq('modelo_id', modelos[0].id)
        .order('ordem_exibicao');

      if (error) throw error;
      return data as CampoModelo[];
    },
    enabled: !!modelos[0]?.id,
  });

  // Verificar se o modelo usa baterias
  const usesBaterias = modelUsesBaterias(campos);

  // Bateria management - only initialize if the model uses baterias
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
  } = useDynamicBaterias({ 
    modalityId, 
    eventId: eventId || ''
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

  if (isLoading || isLoadingModelos) {
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

      {/* Athletes Scoring Section */}
      <Card>
        <CardHeader className={isMobile ? 'pb-4' : ''}>
          <CardTitle className="text-base sm:text-lg">Registro de Pontuações - Modalidade</CardTitle>
          <div className="text-center text-xs sm:text-sm text-muted-foreground">
            Mostrando {filteredAthletes.length} de {athletes.length} atletas
            {hasDynamicScoring && modelos[0] && (
              <div className="mt-2 text-xs bg-green-50 text-green-700 p-2 rounded border">
                <strong>Sistema de Pontuação Dinâmica Ativo</strong>
                <div className="mt-1">
                  Modelo: {modelos[0].descricao || modelos[0].codigo_modelo}
                </div>
                <div className="mt-1">
                  {usesBaterias ? 'Sistema de baterias: Ativo' : 'Sistema de baterias: Inativo'}
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
            {hasDynamicScoring && modelos[0] ? (
              <DynamicScoringTable
                athletes={filteredAthletes}
                modalityId={modalityId}
                eventId={eventId}
                judgeId={judgeId}
                modelo={modelos[0]}
                selectedBateriaId={selectedBateriaId}
              />
            ) : (
              <AthletesTable
                athletes={filteredAthletes}
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
    </div>
  );
}
