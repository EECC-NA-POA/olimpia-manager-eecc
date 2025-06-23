
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { BateriaScore } from '../types';

interface UseBateriaScoresProps {
  athleteId: string;
  modalityId: number;
  eventId: string;
  baterias: Array<{ id: number; numero: number }>;
}

export function useBateriaScores({ athleteId, modalityId, eventId, baterias }: UseBateriaScoresProps) {
  const { data: batteriaScores, isLoading: isLoadingScores } = useQuery({
    queryKey: ['bateria-scores', athleteId, modalityId, eventId],
    queryFn: async () => {
      console.log('Fetching bateria scores for:', { athleteId, modalityId, eventId });
      
      // Get all bateria IDs for this modality
      const bateriaIds = baterias.map(b => b.id);
      
      if (bateriaIds.length === 0) {
        console.log('No baterias found, returning empty array');
        return [];
      }
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('id, bateria_id, valor_pontuacao, unidade, observacoes')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('atleta_id', athleteId)
        .in('bateria_id', bateriaIds)
        .order('bateria_id');
      
      if (error) {
        console.error('Error fetching bateria scores:', error);
        return [];
      }
      
      console.log('Fetched bateria scores raw data:', data);
      
      // Map the scores to include bateria info
      const mappedScores = (data || []).map(score => ({
        ...score,
        bateria_numero: baterias.find(b => b.id === score.bateria_id)?.numero || 0
      }));
      
      console.log('Mapped bateria scores:', mappedScores);
      return mappedScores as BateriaScore[];
    },
    enabled: !!athleteId && !!modalityId && !!eventId && baterias.length > 0,
  });

  return {
    batteriaScores,
    isLoadingScores
  };
}
