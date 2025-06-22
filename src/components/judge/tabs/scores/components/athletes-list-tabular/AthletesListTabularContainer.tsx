
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
import { ErrorState } from '@/components/ErrorState';

interface AthletesListTabularContainerProps {
  athletes: Athlete[] | undefined;
  isLoading: boolean;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType: 'tempo' | 'distancia' | 'pontos';
  error?: string | null;
}

export function AthletesListTabularContainer({
  athletes,
  isLoading,
  modalityId,
  eventId,
  judgeId,
  scoreType,
  error
}: AthletesListTabularContainerProps) {
  // Get modality data with modelo configuration
  const modalityResult = useModalityWithModelo(modalityId);
  const { 
    data: modalityData, 
    modalityRule, 
    isLoading: isLoadingModalityData,
    hasModelo
  } = modalityResult;
  
  // Extract modalityError safely with proper typing
  const modalityError = ('error' in modalityResult && typeof modalityResult.error === 'string') 
    ? modalityResult.error 
    : null;

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

  console.log('=== DEBUG DO CONTAINER DE ATLETAS ===');
  console.log('Props recebidas:', {
    modalityId,
    eventId,
    quantidadeAtletas: athletes?.length || 0,
    carregando: isLoading,
    erro: error,
    judgeId,
    scoreType
  });
  console.log('Dados dos atletas:', athletes);
  console.log('Dados da modalidade:', {
    hasModelo,
    usesBaterias,
    selectedBateriaId,
    carregandoModalidade: isLoadingModalityData,
    erroModalidade: modalityError,
    modalityData,
    modalityRule
  });

  if (isLoading || isLoadingModalityData) {
    console.log('Mostrando estado de carregamento');
    return <LoadingState />;
  }

  // Show error state if there's an error
  if (error || modalityError) {
    console.log('Mostrando estado de erro:', error || modalityError);
    return (
      <ErrorState 
        message={error || modalityError || 'Erro ao carregar dados'} 
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!eventId) {
    console.log('Evento não selecionado');
    return <EventValidationCard />;
  }

  const safeAthletes = athletes || [];
  console.log('=== VERIFICAÇÃO SEGURA DE ATLETAS ===');
  console.log('Array de atletas:', safeAthletes);
  console.log('Quantidade de atletas:', safeAthletes.length);
  console.log('Primeiro atleta:', safeAthletes[0]);
  console.log('=== FIM DA VERIFICAÇÃO ===');

  if (safeAthletes.length === 0) {
    console.log('Nenhum atleta encontrado - mostrando card vazio');
    return <EmptyAthletesCard />;
  }

  // Show dynamic scoring table if modelo is configured
  if (hasModelo && modalityData?.modelo) {
    console.log('Mostrando card de pontuação dinâmica');
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
  console.log('Mostrando card de pontuação regular');
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
