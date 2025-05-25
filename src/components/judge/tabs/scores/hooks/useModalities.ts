import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Modality } from '@/lib/types/database';

export interface ModalityWithScoreType extends Modality {
  tipo_pontuacao: 'tempo' | 'distancia' | 'pontos';
}

export function useModalities(eventId: string | null) {
  return useQuery({
    queryKey: ['judge-modalities', eventId],
    queryFn: async () => {
      if (!eventId) return [];

      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, categoria, tipo_modalidade, tipo_pontuacao')
        .eq('evento_id', eventId)
        .order('nome');

      if (error) {
        console.error('Error fetching modalities:', error);
        throw error;
      }

      console.log('Fetched modalities with scoring types:', data);
      return data as Modality[];
    },
    enabled: !!eventId,
  });
}
