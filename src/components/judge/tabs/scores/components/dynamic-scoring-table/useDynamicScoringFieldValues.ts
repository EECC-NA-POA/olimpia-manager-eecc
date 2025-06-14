
import { useMemo } from 'react';

interface UseDynamicScoringFieldValuesProps {
  editValues: Record<string, any>;
  existingScores: any[];
  selectedBateriaId?: number | null;
  updateFieldValue: (athleteId: string, fieldKey: string, value: string | number) => void;
  hasUnsavedChanges: (athleteId: string) => boolean;
}

export function useDynamicScoringFieldValues({
  editValues,
  existingScores,
  selectedBateriaId,
  updateFieldValue,
  hasUnsavedChanges
}: UseDynamicScoringFieldValuesProps) {
  
  const getFieldValue = (athleteId: string, fieldKey: string): string | number => {
    // First check if there's an edit value
    if (editValues[athleteId]?.[fieldKey] !== undefined) {
      return editValues[athleteId][fieldKey];
    }

    // Then check existing scores for this bateria
    const existingScore = existingScores.find(score => 
      score.atleta_id === athleteId && 
      (selectedBateriaId ? score.numero_bateria === selectedBateriaId : true)
    );

    if (existingScore?.tentativas) {
      // tentativas is an object, not an array, so we access it directly by key
      const tentativa = existingScore.tentativas[fieldKey];
      if (tentativa) {
        return tentativa.valor;
      }
    }

    return '';
  };

  const getDisplayValue = (athleteId: string, fieldKey: string): string => {
    const value = getFieldValue(athleteId, fieldKey);
    return value?.toString() || '';
  };

  const hasExistingScore = (athleteId: string): boolean => {
    return existingScores.some(score => 
      score.atleta_id === athleteId && 
      (selectedBateriaId ? score.numero_bateria === selectedBateriaId : true)
    );
  };

  const handleFieldChange = (athleteId: string, fieldKey: string, value: string | number) => {
    updateFieldValue(athleteId, fieldKey, value);
  };

  return {
    getFieldValue,
    getDisplayValue,
    hasExistingScore,
    handleFieldChange
  };
}
