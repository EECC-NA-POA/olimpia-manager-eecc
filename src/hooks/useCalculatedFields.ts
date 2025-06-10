
import { useState } from 'react';
import { CampoModelo, CalculationResult } from '@/types/dynamicScoring';
import { useCalculatedFieldsData } from './calculatedFields/useCalculatedFieldsData';
import { useCalculationOperations } from './calculatedFields/useCalculationOperations';
import { canCalculateField } from './calculatedFields/fieldValidator';
import { calculatePlacement } from './calculatedFields/placementCalculator';
import { UseCalculatedFieldsProps } from './calculatedFields/types';

export function useCalculatedFields({
  modeloId,
  modalityId,
  eventId,
  bateriaId
}: UseCalculatedFieldsProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  
  const {
    allFields,
    calculatedFields,
    existingScores
  } = useCalculatedFieldsData({
    modeloId,
    modalityId,
    eventId,
    bateriaId
  });

  const { saveCalculation, isSaving } = useCalculationOperations();

  // Check if a field can be calculated
  const canCalculate = (campo: CampoModelo): boolean => {
    return canCalculateField(campo, existingScores);
  };

  const calculateField = async (campo: CampoModelo): Promise<CalculationResult[]> => {
    setIsCalculating(true);
    try {
      switch (campo.metadados?.tipo_calculo) {
        case 'colocacao_bateria':
        case 'colocacao_final':
          return await calculatePlacement({
            campo,
            existingScores,
            allFields
          });
        default:
          throw new Error('Tipo de cálculo não suportado');
      }
    } finally {
      setIsCalculating(false);
    }
  };

  const confirmCalculation = async (results: CalculationResult[]) => {
    await saveCalculation(results);
  };

  return {
    calculatedFields,
    canCalculate,
    calculateField,
    confirmCalculation,
    isCalculating: isCalculating || isSaving
  };
}
