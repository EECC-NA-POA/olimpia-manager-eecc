
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useCamposModelo } from '@/hooks/useDynamicScoring';
import { useDynamicScoringSubmission } from '@/hooks/useDynamicScoringSubmission';
import { Athlete } from '../../hooks/useAthletes';

interface UseDynamicScoringTableStateProps {
  athletes: Athlete[];
  modalityId: number;
  eventId: string;
  judgeId: string;
  modelo: any;
  selectedBateriaId?: number | null;
}

export function useDynamicScoringTableState({
  athletes,
  modalityId,
  eventId,
  judgeId,
  modelo,
  selectedBateriaId
}: UseDynamicScoringTableStateProps) {
  const [scoreData, setScoreData] = useState<Record<string, Record<string, string>>>({});
  const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());

  // Get campos for this modelo
  const { data: campos = [], isLoading: isLoadingCampos } = useCamposModelo(modelo?.id);
  
  // Get dynamic scoring submission hook
  const dynamicSubmission = useDynamicScoringSubmission();

  // Fetch existing scores
  const { data: existingScores = [] } = useQuery({
    queryKey: ['athlete-dynamic-scores', modalityId, eventId, selectedBateriaId],
    queryFn: async () => {
      if (!eventId) return [];
      
      let query = supabase
        .from('pontuacoes')
        .select('*, tentativas(*)')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('modelo_id', modelo?.id)
        .in('atleta_id', athletes.map(a => a.atleta_id));

      // Filter by bateria if selected
      if (selectedBateriaId) {
        // Get bateria number first
        const { data: bateriaData } = await supabase
          .from('baterias')
          .select('numero')
          .eq('id', selectedBateriaId)
          .single();
        
        if (bateriaData) {
          query = query.eq('numero_bateria', bateriaData.numero);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching scores:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!eventId && !!modelo?.id && athletes.length > 0,
  });

  // Initialize score data from existing scores
  useEffect(() => {
    const initialData: Record<string, Record<string, string>> = {};
    
    athletes.forEach(athlete => {
      initialData[athlete.atleta_id] = {};
      
      // Find existing score for this athlete
      const existingScore = existingScores.find(s => s.atleta_id === athlete.atleta_id);
      
      if (existingScore && existingScore.tentativas) {
        // Populate from tentativas
        existingScore.tentativas.forEach((tentativa: any) => {
          if (tentativa.campo_chave) {
            initialData[athlete.atleta_id][tentativa.campo_chave] = tentativa.valor || '';
          }
        });
      }
    });
    
    setScoreData(initialData);
  }, [athletes, existingScores]);

  const handleFieldChange = (athleteId: string, fieldKey: string, value: string) => {
    setScoreData(prev => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        [fieldKey]: value
      }
    }));
    
    setUnsavedChanges(prev => new Set(prev).add(athleteId));
  };

  const saveAthleteScore = async (athleteId: string) => {
    const athleteData = scoreData[athleteId];
    if (!athleteData) return;

    try {
      await dynamicSubmission.mutateAsync({
        athleteId,
        modalityId,
        eventId,
        judgeId,
        modeloId: modelo.id,
        formData: athleteData,
        bateriaId: selectedBateriaId
      });
      
      setUnsavedChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(athleteId);
        return newSet;
      });
    } catch (error) {
      console.error('Error saving athlete score:', error);
    }
  };

  const saveAllScores = async () => {
    const promises = Array.from(unsavedChanges).map(athleteId => saveAthleteScore(athleteId));
    await Promise.all(promises);
  };

  const getAthleteCompletionStatus = (athleteId: string) => {
    const athleteData = scoreData[athleteId] || {};
    const requiredFields = campos.filter(c => c.obrigatorio);
    const completedRequired = requiredFields.filter(field => 
      athleteData[field.chave_campo] && athleteData[field.chave_campo].trim() !== ''
    );
    
    return {
      completed: completedRequired.length,
      total: requiredFields.length,
      isComplete: completedRequired.length === requiredFields.length
    };
  };

  return {
    scoreData,
    unsavedChanges,
    campos,
    isLoadingCampos,
    dynamicSubmission,
    handleFieldChange,
    saveAthleteScore,
    saveAllScores,
    getAthleteCompletionStatus
  };
}
