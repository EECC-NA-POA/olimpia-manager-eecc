
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Athlete } from '../../hooks/useAthletes';

interface UseAthletesScoreStatusProps {
  athletes: Athlete[];
  modalityId: number;
  eventId: string | null;
}

export function useAthletesScoreStatus({ athletes, modalityId, eventId }: UseAthletesScoreStatusProps) {
  const { data: scoresStatus = {} } = useQuery({
    queryKey: ['athletes-scores-status', modalityId, eventId, athletes.map(a => a.atleta_id)],
    queryFn: async () => {
      if (!eventId || athletes.length === 0) return {};
      
      const athleteIds = athletes.map(a => a.atleta_id);
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('atleta_id')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .in('atleta_id', athleteIds);
      
      if (error) {
        console.error('Error fetching athletes scores status:', error);
        return {};
      }
      
      // Create a map of athlete IDs that have scores
      const scoresMap: Record<string, boolean> = {};
      athletes.forEach(athlete => {
        scoresMap[athlete.atleta_id] = false;
      });
      
      data.forEach(score => {
        scoresMap[score.atleta_id] = true;
      });
      
      return scoresMap;
    },
    enabled: !!eventId && athletes.length > 0
  });

  return scoresStatus;
}
