
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useAthletePaymentData(athleteId: string, eventId: string | null) {
  return useQuery({
    queryKey: ['athlete-payment', athleteId, eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pagamentos')
        .select('numero_identificador')
        .eq('atleta_id', athleteId)
        .eq('evento_id', eventId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching payment identifier:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!athleteId && !!eventId,
  });
}

export function useAthleteBranchData(athleteId: string) {
  return useQuery({
    queryKey: ['athlete-branch', athleteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          filiais (
            nome,
            estado
          )
        `)
        .eq('id', athleteId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching branch data:', error);
        return null;
      }
      
      // Return the first filial from the array, or null if no filials
      return Array.isArray(data?.filiais) && data.filiais.length > 0 ? data.filiais[0] : null;
    },
    enabled: !!athleteId,
  });
}

export function useAthleteScores(athleteId: string) {
  return useQuery({
    queryKey: ['athlete-scores', athleteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('valor_pontuacao, modalidade_id')
        .eq('atleta_id', athleteId);
      
      if (error) {
        console.error('Error fetching athlete scores:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!athleteId,
  });
}
