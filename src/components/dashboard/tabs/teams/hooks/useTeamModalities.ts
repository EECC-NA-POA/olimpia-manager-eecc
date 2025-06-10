
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useTeamModalities(eventId: string | null) {
  return useQuery({
    queryKey: ['team-modalities', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, categoria, tipo_modalidade')
        .eq('evento_id', eventId)
        .eq('tipo_modalidade', 'coletivo');
      
      if (error) {
        console.error('Error fetching team modalities:', error);
        throw new Error('Não foi possível carregar as modalidades coletivas');
      }
      
      return data;
    },
    enabled: !!eventId,
  });
}
