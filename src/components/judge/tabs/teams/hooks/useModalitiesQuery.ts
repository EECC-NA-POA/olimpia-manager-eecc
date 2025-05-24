
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ModalityOption } from '../types';

export function useModalitiesQuery(eventId: string | null) {
  return useQuery({
    queryKey: ['all-modalities', eventId],
    queryFn: async (): Promise<ModalityOption[]> => {
      if (!eventId) return [];

      console.log('Fetching modalities for filter with eventId:', eventId);

      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, categoria, tipo_modalidade')
        .eq('evento_id', eventId)
        .eq('tipo_modalidade', 'coletiva') // Buscar modalidades coletivas
        .order('nome');

      console.log('Modalities query result:', { data, error });

      if (error) {
        console.error('Error fetching modalities:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!eventId,
  });
}
