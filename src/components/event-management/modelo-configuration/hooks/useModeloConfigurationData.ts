
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useModeloConfigurationData(eventId: string | null) {
  const { data: modelos = [], isLoading, refetch } = useQuery({
    queryKey: ['modelo-configurations', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      console.log('Fetching modelo configurations for event:', eventId);
      
      // First get modalidades for this event
      const { data: modalidades, error: modalidadesError } = await supabase
        .from('modalidades')
        .select('id, nome')
        .eq('evento_id', eventId);
      
      if (modalidadesError) {
        console.error('Error fetching modalidades:', modalidadesError);
        throw modalidadesError;
      }
      
      console.log('Found modalidades:', modalidades);
      
      if (!modalidades || modalidades.length === 0) {
        console.log('No modalidades found for event');
        return [];
      }
      
      const modalidadeIds = modalidades.map(m => m.id);
      console.log('Searching for modelos with modalidade_ids:', modalidadeIds);
      
      const { data, error } = await supabase
        .from('modelos_modalidade')
        .select(`
          id,
          modalidade_id,
          codigo_modelo,
          descricao,
          parametros
        `)
        .in('modalidade_id', modalidadeIds);

      if (error) {
        console.error('Error fetching modelo configurations:', error);
        throw error;
      }

      console.log('Raw modelos data:', data);
      
      // Enrich with modalidade names
      const enrichedData = (data || []).map(modelo => {
        const modalidade = modalidades.find(m => m.id === modelo.modalidade_id);
        return {
          ...modelo,
          modalidade: {
            nome: modalidade?.nome || 'Modalidade não encontrada'
          }
        };
      });

      console.log('Enriched modelos data:', enrichedData);
      return enrichedData;
    },
    enabled: !!eventId,
  });

  return { modelos, isLoading, refetch };
}
