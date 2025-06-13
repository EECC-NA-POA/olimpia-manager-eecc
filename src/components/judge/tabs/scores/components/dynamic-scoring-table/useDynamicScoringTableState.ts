
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useDynamicScoringSubmission } from '@/hooks/useDynamicScoringSubmission';
import { CampoModelo } from '@/types/dynamicScoring';
import { Athlete } from '../../hooks/useAthletes';

interface AthleteScoreData {
  [athleteId: string]: {
    [fieldKey: string]: string | number;
  };
}

export function useDynamicScoringTableState() {
  const [editingAthletes, setEditingAthletes] = useState<Set<string>>(new Set());
  const [editValues, setEditValues] = useState<AthleteScoreData>({});
  const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());

  const startEditing = (athleteId: string, existingScore: any, campos: CampoModelo[]) => {
    setEditingAthletes(prev => new Set(prev).add(athleteId));
    
    // Initialize edit values with existing data
    if (existingScore?.tentativas) {
      const initialValues: { [key: string]: string | number } = {};
      campos.forEach(campo => {
        const value = existingScore.tentativas[campo.chave_campo];
        if (value !== undefined && value !== null) {
          initialValues[campo.chave_campo] = value;
        }
      });
      setEditValues(prev => ({
        ...prev,
        [athleteId]: initialValues
      }));
    }
  };

  const stopEditing = (athleteId: string) => {
    setEditingAthletes(prev => {
      const newSet = new Set(prev);
      newSet.delete(athleteId);
      return newSet;
    });
    
    // Remove edit values for this athlete
    setEditValues(prev => {
      const newValues = { ...prev };
      delete newValues[athleteId];
      return newValues;
    });
  };

  const updateFieldValue = (athleteId: string, fieldKey: string, value: string | number) => {
    setEditValues(prev => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        [fieldKey]: value
      }
    }));
    
    setUnsavedChanges(prev => new Set(prev).add(athleteId));
  };

  const hasUnsavedChanges = () => {
    return unsavedChanges.size > 0;
  };

  const clearUnsavedChanges = (athleteId: string) => {
    setUnsavedChanges(prev => {
      const newSet = new Set(prev);
      newSet.delete(athleteId);
      return newSet;
    });
  };

  return {
    editingAthletes,
    editValues,
    unsavedChanges,
    startEditing,
    stopEditing,
    updateFieldValue,
    hasUnsavedChanges,
    clearUnsavedChanges
  };
}
