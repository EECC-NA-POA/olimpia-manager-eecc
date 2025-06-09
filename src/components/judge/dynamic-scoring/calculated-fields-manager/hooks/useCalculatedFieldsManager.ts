
import { useState } from 'react';
import { useCalculatedFields } from '@/hooks/useCalculatedFields';
import { useAthleteParticipation } from '../../../calculated-fields/hooks/useAthleteParticipation';
import { CalculationResult } from '@/types/dynamicScoring';
import { toast } from 'sonner';

interface UseCalculatedFieldsManagerProps {
  modeloId: number;
  modalityId: number;
  eventId: string;
  bateriaId?: number;
}

export function useCalculatedFieldsManager({
  modeloId,
  modalityId,
  eventId,
  bateriaId
}: UseCalculatedFieldsManagerProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [calculationResults, setCalculationResults] = useState<CalculationResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const {
    calculatedFields,
    canCalculate,
    calculateField,
    confirmCalculation,
    isCalculating
  } = useCalculatedFields({
    modeloId,
    modalityId,
    eventId,
    bateriaId
  });

  const {
    athletesWithParticipation,
    toggleAthleteParticipation,
    getParticipatingAthletes,
    allRequiredFieldsCompleted,
    isLoadingParticipation
  } = useAthleteParticipation({
    modalityId,
    eventId,
    bateriaId,
    modeloId
  });

  const handleFieldSelection = (fieldKey: string, checked: boolean) => {
    if (checked) {
      setSelectedFields(prev => [...prev, fieldKey]);
    } else {
      setSelectedFields(prev => prev.filter(key => key !== fieldKey));
    }
  };

  const handleCalculateSelected = async () => {
    if (selectedFields.length === 0) {
      toast.error('Selecione pelo menos um campo para calcular');
      return;
    }

    const participatingAthletes = getParticipatingAthletes();
    if (participatingAthletes.length < 2) {
      toast.error('É necessário pelo menos 2 atletas participando para calcular colocações');
      return;
    }

    try {
      const results: CalculationResult[] = [];
      
      for (const fieldKey of selectedFields) {
        const field = calculatedFields.find(f => f.chave_campo === fieldKey);
        if (field && canCalculate(field)) {
          console.log('Calculating field:', field.chave_campo, 'Type:', field.metadados?.tipo_calculo);
          const fieldResults = await calculateField(field);
          results.push(...fieldResults);
        } else {
          console.warn('Cannot calculate field:', fieldKey, 'Field found:', !!field);
        }
      }
      
      if (results.length > 0) {
        setCalculationResults(results);
        setShowResults(true);
        toast.success(`${results.length} colocações calculadas com sucesso!`);
      } else {
        toast.warning('Nenhuma colocação foi calculada. Verifique se os dados estão completos.');
      }
    } catch (error) {
      console.error('Error calculating fields:', error);
      toast.error('Erro ao calcular campos: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  const handleConfirmCalculations = async () => {
    try {
      await confirmCalculation(calculationResults);
      setCalculationResults([]);
      setShowResults(false);
      setSelectedFields([]);
      toast.success('Colocações calculadas e salvas com sucesso!');
    } catch (error) {
      console.error('Error confirming calculations:', error);
      toast.error('Erro ao salvar cálculos: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  const handleCancelResults = () => {
    setShowResults(false);
    setCalculationResults([]);
  };

  const participatingAthletes = getParticipatingAthletes();
  const canCalculateFields = allRequiredFieldsCompleted && participatingAthletes.length > 1;

  return {
    // State
    selectedFields,
    calculationResults,
    showResults,
    
    // Data
    calculatedFields,
    athletesWithParticipation,
    participatingAthletes,
    
    // Computed
    canCalculateFields,
    allRequiredFieldsCompleted,
    
    // Loading states
    isCalculating,
    isLoadingParticipation,
    
    // Functions
    canCalculate,
    toggleAthleteParticipation,
    handleFieldSelection,
    handleCalculateSelected,
    handleConfirmCalculations,
    handleCancelResults
  };
}
