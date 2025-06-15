
import React from 'react';

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
  const getFieldValue = React.useCallback((athleteId: string, fieldKey: string): string | number => {
    // First check for edit values (unsaved changes)
    if (editValues[athleteId] && editValues[athleteId][fieldKey] !== undefined) {
      return editValues[athleteId][fieldKey];
    }

    // Then check existing scores
    const existingScore = existingScores.find(score => {
      const matchesAthlete = score.atleta_id === athleteId;
      
      if (selectedBateriaId) {
        // For bateria system, match specific bateria
        return matchesAthlete && score.numero_bateria === selectedBateriaId;
      } else {
        // For non-bateria system, find any score for this athlete
        return matchesAthlete;
      }
    });

    if (existingScore && existingScore.campos_valores) {
      const fieldValue = existingScore.campos_valores[fieldKey];
      if (fieldValue !== undefined && fieldValue !== null) {
        return fieldValue;
      }
    }

    return '';
  }, [editValues, existingScores, selectedBateriaId]);

  const getDisplayValue = React.useCallback((athleteId: string, fieldKey: string): string => {
    const value = getFieldValue(athleteId, fieldKey);
    if (value === '' || value === null || value === undefined) {
      return '-';
    }
    return String(value);
  }, [getFieldValue]);

  const hasExistingScore = React.useCallback((athleteId: string): boolean => {
    console.log(`Checking if athlete ${athleteId} has existing score. Selected bateria: ${selectedBateriaId}`);
    console.log('Existing scores:', existingScores.length);
    
    const hasScore = existingScores.some(score => {
      const matchesAthlete = score.atleta_id === athleteId;
      
      if (selectedBateriaId) {
        // For bateria system, check specific bateria
        const matchesBateria = score.numero_bateria === selectedBateriaId;
        const result = matchesAthlete && matchesBateria;
        console.log(`Athlete ${athleteId} - matches athlete: ${matchesAthlete}, matches bateria ${selectedBateriaId}: ${matchesBateria}, final result: ${result}`);
        return result;
      } else {
        // For non-bateria system, any score counts
        console.log(`Athlete ${athleteId} - non-bateria mode, has score: ${matchesAthlete}`);
        return matchesAthlete;
      }
    });
    
    console.log(`Final result for athlete ${athleteId}: ${hasScore}`);
    return hasScore;
  }, [existingScores, selectedBateriaId]);

  const handleFieldChange = React.useCallback((athleteId: string, fieldKey: string, value: string | number) => {
    updateFieldValue(athleteId, fieldKey, value);
  }, [updateFieldValue]);

  return {
    getFieldValue,
    getDisplayValue,
    hasExistingScore,
    handleFieldChange
  };
}
