
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
  
  // Memoize existing scores for better performance
  const existingScoresMap = useMemo(() => {
    const map = new Map();
    existingScores.forEach(score => {
      map.set(score.atleta_id, score);
    });
    return map;
  }, [existingScores]);

  const getFieldValue = (athleteId: string, fieldKey: string): string | number => {
    console.log(`getFieldValue called for athlete ${athleteId}, field ${fieldKey}`);
    
    // First check if we have unsaved changes for this athlete and field
    const athleteEditValues = editValues[athleteId];
    if (athleteEditValues && athleteEditValues[fieldKey] !== undefined) {
      console.log(`Found edit value for ${athleteId}.${fieldKey}:`, athleteEditValues[fieldKey]);
      return athleteEditValues[fieldKey];
    }

    // Then check existing scores
    const existingScore = existingScoresMap.get(athleteId);
    if (existingScore?.tentativas && existingScore.tentativas[fieldKey]) {
      const tentativa = existingScore.tentativas[fieldKey];
      const value = tentativa.valor_formatado || tentativa.valor || '';
      console.log(`Found existing score for ${athleteId}.${fieldKey}:`, value);
      return value;
    }

    console.log(`No value found for ${athleteId}.${fieldKey}, returning empty`);
    return '';
  };

  const getDisplayValue = (athleteId: string, fieldKey: string): string => {
    console.log(`getDisplayValue called for athlete ${athleteId}, field ${fieldKey}`);
    
    const value = getFieldValue(athleteId, fieldKey);
    
    // Special formatting for bateria field
    if ((fieldKey === 'bateria' || fieldKey === 'numero_bateria') && value) {
      const displayValue = value === '999' || value === 999 ? 'Final' : value.toString();
      console.log(`Bateria field display value for ${athleteId}:`, displayValue);
      return displayValue;
    }
    
    const displayValue = value?.toString() || '';
    console.log(`Display value for ${athleteId}.${fieldKey}:`, displayValue);
    return displayValue;
  };

  const hasExistingScore = (athleteId: string): boolean => {
    const hasScore = existingScoresMap.has(athleteId);
    console.log(`hasExistingScore for ${athleteId}:`, hasScore);
    return hasScore;
  };

  const handleFieldChange = (athleteId: string, fieldKey: string, value: string | number) => {
    console.log(`handleFieldChange called:`, { athleteId, fieldKey, value });
    updateFieldValue(athleteId, fieldKey, value);
  };

  return {
    getFieldValue,
    getDisplayValue,
    hasExistingScore,
    handleFieldChange
  };
}
