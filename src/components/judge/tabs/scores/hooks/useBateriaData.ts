
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Bateria {
  id: number;
  numero: number;
  modalidade_id: number;
  evento_id: string;
}

export function useBateriaData(modalityId: number | null, eventId: string | null) {
  return useQuery({
    queryKey: ['baterias', modalityId, eventId],
    queryFn: async () => {
      if (!modalityId || !eventId) return [];

      console.log('Fetching baterias for modality:', modalityId, 'event:', eventId);

      const { data, error } = await supabase
        .from('baterias')
        .select('*')
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId)
        .order('numero');

      if (error) {
        console.error('Error fetching baterias:', error);
        throw error;
      }

      console.log('Fetched baterias:', data);
      return data as Bateria[];
    },
    enabled: !!modalityId && !!eventId,
  });
}
