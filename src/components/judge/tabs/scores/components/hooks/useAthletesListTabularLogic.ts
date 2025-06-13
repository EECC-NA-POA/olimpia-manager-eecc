
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useModelosModalidade } from '@/hooks/useDynamicScoring';
import { useModeloConfiguration } from '../../hooks/useModeloConfiguration';
import { useDynamicBaterias } from '../../hooks/useDynamicBaterias';
import { useBateriaAthleteSelection } from '../../hooks/useBateriaAthleteSelection';
import { useAthletesBranchData } from './useAthletesBranchData';
import { useAthletesScoreStatus } from './useAthletesScoreStatus';
import { useAthletesFiltering } from './useAthletesFiltering';
import { Athlete } from '../../hooks/useAthletes';
import { CampoModelo } from '@/types/dynamicScoring';

interface UseAthletesListTabularLogicProps {
  athletes: Athlete[] | undefined;
  modalityId: number;
  eventId: string | null;
}

export function useAthletesListTabularLogic({
  athletes,
  modalityId,
  eventId
}: UseAthletesListTabularLogicProps) {
  // Check for dynamic scoring
  const { data: modelos = [], isLoading: isLoadingModelos } = useModelosModalidade(modalityId);
  const hasDynamicScoring = modelos.length > 0;

  // Get modelo configuration to check if it uses baterias
  const { data: modeloConfig, isLoading: isLoadingConfig } = useModeloConfiguration(modalityId);

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

  const usesBaterias = modeloConfig?.parametros?.baterias === true;

  // Bateria management
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

  return {
    modelos,
    isLoadingModelos,
    isLoadingConfig,
    campos,
    hasDynamicScoring,
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
    availableBranches,
    availableStates,
    filters,
    setFilters,
    resetFilters,
    athletesToShow
  };
}
