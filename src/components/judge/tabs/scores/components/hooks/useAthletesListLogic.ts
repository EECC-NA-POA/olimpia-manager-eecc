
import { useState } from 'react';
import { useModelosModalidade } from '@/hooks/useDynamicScoring';
import { useModeloConfiguration } from '../../hooks/useModeloConfiguration';
import { useDynamicBaterias } from '../../hooks/useDynamicBaterias';
import { useBateriaAthleteSelection } from '../../hooks/useBateriaAthleteSelection';
import { useBateriaData } from '../../hooks/useBateriaData';
import { Athlete } from '../../hooks/useAthletes';

interface UseAthletesListLogicProps {
  modalityId: number;
  eventId: string | null;
  athletes: Athlete[] | undefined;
}

export function useAthletesListLogic({
  modalityId,
  eventId,
  athletes
}: UseAthletesListLogicProps) {
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

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

  // Fetch baterias data for legacy scoring
  const { data: bateriasData = [], isLoading: isLoadingBaterias } = useBateriaData(
    modalityId, 
    eventId
  );

  return {
    selectedAthleteId,
    setSelectedAthleteId,
    hasDynamicScoring,
    modelos,
    usesBaterias,
    baterias,
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
    selectedAthletesList,
    handleAthleteToggle,
    handleSelectAll,
    handleClearAll,
    getFilteredAthletes,
    bateriasData
  };
}
