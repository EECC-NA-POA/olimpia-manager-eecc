
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useModeloConfigurationData(eventId: string | null) {
  const { data: modelos = [], isLoading, refetch } = useQuery({
    queryKey: ['modelo-configurations', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      // First get modalidades for this event
      const { data: modalidades, error: modalidadesError } = await supabase
        .from('modalidades')
        .select('id')
        .eq('evento_id', eventId);
      
      if (modalidadesError) {
        console.error('Error fetching modalidades:', modalidadesError);
        throw modalidadesError;
      }
      
      if (!modalidades || modalidades.length === 0) return [];
      
      const modalidadeIds = modalidades.map(m => m.id);
      
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
        .in('modalidade_id', modalidadeIds);

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
