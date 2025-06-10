
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useModeloConfigurationData(eventId: string | null) {
  const { data: modelos = [], isLoading, refetch } = useQuery({
    queryKey: ['modelo-configurations', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('modelos_modalidade')
        .select(`
          id,
          modalidade_id,
          codigo_modelo,
          descricao,
          parametros,
          modalidade:modalidade_id (
            nome
          )
        `)
        .eq('modalidade_id', 'in', 
          `(SELECT id FROM modalidades WHERE evento_id = '${eventId}')`
        );

      if (error) {
        console.error('Error fetching modelo configurations:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!eventId,
  });

  return { modelos, isLoading, refetch };
}
