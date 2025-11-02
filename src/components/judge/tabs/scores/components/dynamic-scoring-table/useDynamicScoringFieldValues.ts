
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
  
  console.log('=== useDynamicScoringFieldValues CALLED ===');
  console.log('Existing scores received:', existingScores.length);
  console.log('Existing scores data:', existingScores);
  
  // Memoize existing scores for better performance
  const existingScoresMap = useMemo(() => {
    console.log('Building existingScoresMap from scores:', existingScores);
    const map = new Map();
    existingScores.forEach(score => {
      console.log(`Adding score for athlete ${score.atleta_id}:`, score);
      map.set(score.atleta_id, score);
    });
    console.log('ExistingScoresMap built with', map.size, 'entries');
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

    // Then check existing scores - FIXED: handle both object and direct value formats
    const existingScore = existingScoresMap.get(athleteId);
    if (existingScore?.tentativas && existingScore.tentativas[fieldKey] !== undefined) {
      const tentativa = existingScore.tentativas[fieldKey];
      
      // Handle different data structures
      let value;
      if (typeof tentativa === 'object' && tentativa !== null) {
        // If tentativa is an object with valor_formatado/valor properties
        value = tentativa.valor_formatado || tentativa.valor;
      } else {
        // If tentativa is a direct value
        value = tentativa;
      }
      
      console.log(`Found existing score for ${athleteId}.${fieldKey}:`, { tentativa, value });
      return value ?? '';
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
