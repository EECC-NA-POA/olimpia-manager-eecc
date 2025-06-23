
import React from 'react';
import { AthleteCard } from '@/components/judge/AthleteCard';
import { DynamicAthleteScoreCard } from '@/components/judge/score-card/DynamicAthleteScoreCard';
import { BateriaNavigationTabs } from './BateriaNavigationTabs';
import { BateriaAthleteSelector } from './BateriaAthleteSelector';
import { useModelosModalidade } from '@/hooks/useDynamicScoring';
import { useDynamicBaterias } from '../hooks/useDynamicBaterias';
import { useModeloConfiguration } from '../hooks/useModeloConfiguration';
import { useBateriaAthleteSelection } from '../hooks/useBateriaAthleteSelection';
import { Athlete } from '../hooks/useAthletes';

interface DynamicAthletesGridProps {
  athletes: Athlete[];
  selectedAthleteId: string | null;
  onAthleteSelect: (athleteId: string | null) => void;
  modalityId: number;
  scoreType: 'tempo' | 'distancia' | 'pontos';
  eventId: string | null;
  judgeId: string;
  modalityRule?: any;
}

export function DynamicAthletesGrid({
  athletes,
  selectedAthleteId,
  onAthleteSelect,
  modalityId,
  scoreType,
  eventId,
  judgeId,
  modalityRule
}: DynamicAthletesGridProps) {
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

  // Apply bateria filtering to athletes
  const athletesToShow = getFilteredAthletes(athletes);

  console.log('DynamicAthletesGrid - Debug info:', {
    modalityId,
    hasDynamicScoring,
    usesBaterias,
    selectedBateriaId,
    selectedAthletesCount: selectedAthletes.size,
    totalAthletes: athletes.length,
    athletesToShow: athletesToShow.length,
    modelosCount: modelos.length,
    modalityRule: modalityRule?.regra_tipo,
  });

  return (
    <div className="space-y-4">
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

      {/* Athletes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {athletesToShow.map((athlete) => (
          <div key={athlete.atleta_id} className="space-y-2">
            {/* Show dynamic scoring card if configured, otherwise show legacy card */}
            {hasDynamicScoring ? (
              <div className="space-y-2">
                {/* Basic athlete info */}
                <div className="bg-card border rounded-lg p-4">
                  <div className="font-medium">{athlete.atleta_nome}</div>
                  <div className="text-sm text-muted-foreground">
                    {athlete.equipe_nome || athlete.filial_nome}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {athlete.origem_uf && `${athlete.origem_uf} • `}
                    {athlete.origem_cidade || athlete.filial_nome}
                  </div>
                </div>
                
                {/* Dynamic scoring component */}
                <DynamicAthleteScoreCard
                  athlete={athlete}
                  modalityId={modalityId}
                  eventId={eventId}
                  judgeId={judgeId}
                  scoreType={scoreType}
                />
              </div>
            ) : (
              /* Legacy scoring card */
              <AthleteCard
                athlete={athlete}
                modalityId={modalityId}
                eventId={eventId}
                judgeId={judgeId}
                scoreType={scoreType}
                modalityRule={modalityRule}
                isSelected={selectedAthleteId === athlete.atleta_id}
                onSelect={() => onAthleteSelect(
                  selectedAthleteId === athlete.atleta_id ? null : athlete.atleta_id
                )}
              />
            )}
          </div>
        ))}
      </div>

      {athletesToShow.length === 0 && athletes.length > 0 && usesBaterias && selectedBateriaId && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-lg font-medium mb-2">Nenhum atleta selecionado para esta bateria</p>
          <p className="text-sm">
            Use o seletor de atletas acima para escolher os participantes desta bateria.
          </p>
        </div>
      )}
    </div>
  );
}
