
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
  const [scoreData, setScoreData] = useState<AthleteScoreData>({});
  const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());
  
  const dynamicSubmission = useDynamicScoringSubmission();

  // Fetch campos do modelo
  const { data: campos = [], isLoading: isLoadingCampos } = useQuery({
    queryKey: ['campos-modelo', modelo.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campos_modelo')
        .select('*')
        .eq('modelo_id', modelo.id)
        .neq('tipo_input', 'calculated')
        .order('ordem_exibicao');

      if (error) throw error;
      return data as CampoModelo[];
    },
    enabled: !!modelo.id
  });

  // Fetch existing scores with tentativas, filtered by bateria if selected
  const { data: existingScores = [] } = useQuery({
    queryKey: ['athlete-dynamic-scores', modalityId, eventId, modelo.id, selectedBateriaId],
    queryFn: async () => {
      let query = supabase
        .from('pontuacoes')
        .select(`
          *,
          tentativas_pontuacao(
            chave_campo,
            valor,
            valor_formatado
          )
        `)
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId)
        .eq('modelo_id', modelo.id)
        .eq('juiz_id', judgeId);

      // Filter by bateria if selected
      if (selectedBateriaId) {
        query = query.eq('numero_bateria', selectedBateriaId);
      } else {
        query = query.is('numero_bateria', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!modalityId && !!eventId && !!modelo.id
  });

  // Initialize score data from existing scores
  useEffect(() => {
    if (existingScores.length > 0) {
      const initialData: AthleteScoreData = {};
      
      existingScores.forEach(score => {
        if (!initialData[score.atleta_id]) {
          initialData[score.atleta_id] = {};
        }
        
        score.tentativas_pontuacao?.forEach((tentativa: any) => {
          const value = tentativa.valor_formatado || tentativa.valor.toString();
          initialData[score.atleta_id][tentativa.chave_campo] = value;
        });
      });
      
      console.log('Loaded initial data for bateria:', selectedBateriaId, initialData);
      setScoreData(initialData);
    } else {
      // Clear data when no scores exist for this bateria
      setScoreData({});
    }
  }, [existingScores, selectedBateriaId]);

  const handleFieldChange = (athleteId: string, fieldKey: string, value: string | number) => {
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
        eventId,
        modalityId,
        athleteId,
        judgeId,
        modeloId: modelo.id,
        formData: athleteData,
        bateriaId: selectedBateriaId || undefined
      });

      setUnsavedChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(athleteId);
        return newSet;
      });

      toast.success(`Pontuação salva para ${athletes.find(a => a.atleta_id === athleteId)?.atleta_nome}`);
    } catch (error) {
      console.error('Error saving score:', error);
      toast.error('Erro ao salvar pontuação');
    }
  };

  const saveAllScores = async () => {
    const unsavedAthletes = Array.from(unsavedChanges);
    
    for (const athleteId of unsavedAthletes) {
      await saveAthleteScore(athleteId);
    }
  };

  const getAthleteCompletionStatus = (athleteId: string) => {
    const athleteData = scoreData[athleteId] || {};
    const requiredFields = campos.filter(c => c.obrigatorio);
    const completedRequired = requiredFields.filter(field => 
      athleteData[field.chave_campo] !== undefined && 
      athleteData[field.chave_campo] !== '' &&
      athleteData[field.chave_campo] !== null
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
