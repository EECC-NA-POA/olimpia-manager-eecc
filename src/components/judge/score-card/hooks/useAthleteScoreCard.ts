
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useScoreSubmission } from './useScoreSubmission';
import { ScoreRecord } from '../types';

interface AthleteData {
  atleta_id: string;
  equipe_id?: number;
}

export function useAthleteScoreCard(
  athlete: AthleteData,
  modalityId: number,
  eventId: string | null,
  judgeId: string,
  scoreType: 'tempo' | 'distancia' | 'pontos',
  modalityRule?: any
) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { submitScoreMutation } = useScoreSubmission(
    eventId, 
    modalityId, 
    athlete, 
    judgeId, 
    scoreType,
    modalityRule
  );

  // Fetch existing score if it exists
  const { data: existingScore } = useQuery({
    queryKey: ['score', athlete.atleta_id, modalityId, eventId],
    queryFn: async () => {
      if (!eventId) return null;
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('*')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('atleta_id', athlete.atleta_id)
        .limit(1);
      
      if (error) {
        console.error('Error fetching existing score:', error);
        return null;
      }
      
      return data && data.length > 0 ? data[0] as ScoreRecord : null;
    },
    enabled: !!eventId && !!athlete.atleta_id && !!modalityId,
  });

  // Fetch medal info from premiacoes
  const { data: medalInfo } = useQuery({
    queryKey: ['medal', athlete.atleta_id, modalityId, eventId],
    queryFn: async () => {
      if (!eventId) return null;
      
      const { data, error } = await supabase
        .from('premiacoes')
        .select('posicao, medalha')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('atleta_id', athlete.atleta_id)
        .limit(1);
      
      if (error) {
        console.error('Error fetching medal info:', error);
        return null;
      }
      
      return data && data.length > 0 ? data[0] : null;
    },
    enabled: !!eventId && !!athlete.atleta_id && !!modalityId,
  });

  // Expand form when score exists
  useEffect(() => {
    if (existingScore) {
      setIsExpanded(true);
    }
  }, [existingScore]);

  // Handle form submission
  const handleSubmit = (data: any) => {
    console.log('AthleteScoreCard - Submitting data:', data);
    submitScoreMutation.mutate(data, {
      onSuccess: () => setIsExpanded(false)
    });
  };

  return {
    isExpanded,
    setIsExpanded,
    existingScore,
    medalInfo,
    handleSubmit,
    isPending: submitScoreMutation.isPending
  };
}
