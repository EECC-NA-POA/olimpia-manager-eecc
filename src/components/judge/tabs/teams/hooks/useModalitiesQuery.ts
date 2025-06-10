
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ModalityOption } from '../types';

export function useModalitiesQuery(eventId: string | null) {
  return useQuery({
    queryKey: ['team-modalities', eventId],
    queryFn: async (): Promise<ModalityOption[]> => {
      if (!eventId) return [];

      console.log('Fetching team modalities for filter with eventId:', eventId);

      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, categoria, tipo_modalidade')
        .eq('evento_id', eventId)
        .eq('tipo_modalidade', 'coletiva')
        .order('nome');

      console.log('Team modalities query result:', { data, error });

      if (error) {
        console.error('Error fetching team modalities:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!eventId,
  });
}
