
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Modality } from '@/lib/types/database';

export function useModalities(eventId: string | null) {
  const queryResult = useQuery({
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
      
      // Transform the data to match the Modality interface
      return data.map(item => ({
        modalidade_id: item.id,
        modalidade_nome: item.nome,
        categoria: item.categoria,
        tipo_modalidade: item.tipo_modalidade,
        tipo_pontuacao: item.tipo_pontuacao
      })) as Modality[];
    },
    enabled: !!eventId,
  });

  return {
    modalities: queryResult.data || [],
    isLoadingModalities: queryResult.isLoading,
    error: queryResult.error
  };
}
