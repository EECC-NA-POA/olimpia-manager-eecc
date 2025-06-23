
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
      if (!modalityId || !eventId) {
        console.log('useBateriaData: Missing parameters', { modalityId, eventId });
        return [];
      }

      console.log('useBateriaData: Fetching baterias for modality:', modalityId, 'event:', eventId);

      const { data, error } = await supabase
        .from('baterias')
        .select('*')
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId)
        .order('numero');

      if (error) {
        console.error('useBateriaData: Error fetching baterias:', error);
        // Don't throw error, just return empty array to allow auto-creation
        return [];
      }

      console.log('useBateriaData: Raw data from database:', data);
      console.log('useBateriaData: Number of baterias found:', data?.length || 0);
      
      if (!data || data.length === 0) {
        console.warn('useBateriaData: No baterias found in database for modality', modalityId, 'event', eventId);
        return [];
      }

      return data as Bateria[];
    },
    enabled: !!modalityId && !!eventId,
  });
}
