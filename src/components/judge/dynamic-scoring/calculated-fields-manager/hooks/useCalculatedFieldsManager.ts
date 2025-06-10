
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
      console.log('Starting calculation for fields:', selectedFields);
      console.log('Participating athletes:', participatingAthletes.length);
      
      const results: CalculationResult[] = [];
      
      for (const fieldKey of selectedFields) {
        const field = calculatedFields.find(f => f.chave_campo === fieldKey);
        if (field && canCalculate(field)) {
          console.log('Calculating field:', field.chave_campo, 'Type:', field.metadados?.tipo_calculo);
          try {
            const fieldResults = await calculateField(field);
            console.log('Field results:', fieldResults);
            results.push(...fieldResults);
          } catch (fieldError) {
            console.error('Error calculating field:', fieldKey, fieldError);
            toast.error(`Erro ao calcular campo ${field.rotulo_campo}: ${fieldError instanceof Error ? fieldError.message : 'Erro desconhecido'}`);
          }
        } else {
          console.warn('Cannot calculate field:', fieldKey, 'Field found:', !!field, 'Can calculate:', field ? canCalculate(field) : false);
          toast.warning(`Campo ${fieldKey} não pode ser calculado no momento`);
        }
      }
      
      console.log('All calculation results:', results);
      
      if (results.length > 0) {
        setCalculationResults(results);
        setShowResults(true);
        toast.success(`${results.length} colocação(ões) calculada(s) com sucesso!`);
      } else {
        toast.warning('Nenhuma colocação foi calculada. Verifique se os dados estão completos e se os atletas estão participando.');
      }
    } catch (error) {
      console.error('Error calculating fields:', error);
      toast.error('Erro ao calcular campos: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  const handleConfirmCalculations = async () => {
    try {
      console.log('Confirming calculations:', calculationResults);
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
