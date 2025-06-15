
import React from 'react';
import { Athlete } from '../../hooks/useAthletes';
import { useModalityWithModelo } from '../../hooks/useModalityWithModelo';
import { useDynamicBaterias } from '../../hooks/useDynamicBaterias';
import { useDynamicScoreData } from '../dynamic-scoring-table/hooks/useDynamicScoreData';
import { LoadingState } from './LoadingState';
import { EventValidationCard } from './EventValidationCard';
import { EmptyAthletesCard } from './EmptyAthletesCard';
import { DynamicScoringCard } from './DynamicScoringCard';
import { RegularScoringCard } from './RegularScoringCard';

interface AthletesListTabularContainerProps {
  athletes: Athlete[] | undefined;
  isLoading: boolean;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType: 'tempo' | 'distancia' | 'pontos';
}

export function AthletesListTabularContainer({
  athletes,
  isLoading,
  modalityId,
  eventId,
  judgeId,
  scoreType
}: AthletesListTabularContainerProps) {
  // Get modality data with modelo configuration
  const { 
    data: modalityData, 
    modalityRule, 
    isLoading: isLoadingModalityData,
    hasModelo
  } = useModalityWithModelo(modalityId);

  // Get bateria data for this modality
  const {
    baterias,
    selectedBateriaId,
    selectedBateria,
    usesBaterias,
    isLoading: isLoadingBaterias,
    setSelectedBateriaId,
    createNewBateria,
    createFinalBateria,
    isCreating
  } = useDynamicBaterias({
    modalityId,
    eventId
  });

  // Get dynamic scoring data when hasModelo is true
  const { campos, existingScores, refetchScores } = useDynamicScoreData({
    modalityId,
    eventId: eventId || '',
    modeloId: modalityData?.modelo?.id,
    selectedBateriaId,
    judgeId,
    athletes: athletes || [],
    enabled: hasModelo && !!modalityData?.modelo?.id
  });

  console.log('=== ATHLETES LIST TABULAR CONTAINER DEBUG ===');
  console.log('Props received:', {
    modalityId,
    eventId,
    athletesCount: athletes?.length || 0,
    isLoading,
    judgeId,
    scoreType
  });
  console.log('Athletes data:', athletes);
  console.log('Modality data:', {
    hasModelo,
    usesBaterias,
    selectedBateriaId,
    isLoadingModalityData,
    modalityData,
    modalityRule
  });
  console.log('Bateria data:', {
    bateriasCount: baterias.length,
    selectedBateriaId,
    selectedBateria,
    isLoadingBaterias
  });
  console.log('Dynamic scoring data:', {
    camposCount: campos.length,
    existingScoresCount: existingScores.length,
    campos,
    existingScores
  });
  console.log('=== END ATHLETES LIST TABULAR CONTAINER DEBUG ===');

  if (isLoading || isLoadingModalityData) {
    return <LoadingState />;
  }

  if (!eventId) {
    return <EventValidationCard />;
  }

  const safeAthletes = athletes || [];
  console.log('=== SAFE ATHLETES CHECK ===');
  console.log('Athletes array:', safeAthletes);
  console.log('Athletes count:', safeAthletes.length);
  console.log('First athlete:', safeAthletes[0]);
  console.log('=== END SAFE ATHLETES CHECK ===');

  if (safeAthletes.length === 0) {
    console.log('No athletes found - showing empty card');
    return <EmptyAthletesCard />;
  }

  // Show dynamic scoring table if modelo is configured
  if (hasModelo && modalityData?.modelo) {
    console.log('Showing dynamic scoring card');
    return (
      <DynamicScoringCard
        athletes={safeAthletes}
        modalityId={modalityId}
        eventId={eventId}
        judgeId={judgeId}
        modalityData={modalityData}
        campos={campos}
        usesBaterias={usesBaterias}
        baterias={baterias}
        selectedBateriaId={selectedBateriaId}
        selectedBateria={selectedBateria}
        isLoadingBaterias={isLoadingBaterias}
        isCreating={isCreating}
        existingScores={existingScores}
        setSelectedBateriaId={setSelectedBateriaId}
        createNewBateria={createNewBateria}
        createFinalBateria={createFinalBateria}
        refetchScores={refetchScores}
      />
    );
  }

  // Fallback to regular scoring table for modalities without modelo
  console.log('Showing regular scoring card');
  return (
    <RegularScoringCard
      athletes={safeAthletes}
      modalityId={modalityId}
      eventId={eventId}
      judgeId={judgeId}
      scoreType={scoreType}
      modalityRule={modalityRule}
      selectedBateriaId={selectedBateriaId}
    />
  );
}
