
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ModalityOption } from '../types';

export function useModalitiesData(eventId: string | null) {
  return useQuery({
    queryKey: ['team-modalities', eventId],
    queryFn: async (): Promise<ModalityOption[]> => {
      if (!eventId) return [];

      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, categoria, tipo_modalidade')
        .eq('evento_id', eventId)
        .eq('tipo_modalidade', 'coletivo')
        .order('nome');

      if (error) throw error;
      return data || [];
    },
    enabled: !!eventId,
  });
}
