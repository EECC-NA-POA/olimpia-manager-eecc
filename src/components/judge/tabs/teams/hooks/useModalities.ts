
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useModalities(eventId: string | null) {
  const { data: modalities, isLoading: isLoadingModalities } = useQuery({
    queryKey: ['collective-modalities', eventId],
    queryFn: async () => {
      console.log('Fetching collective modalities for event:', eventId);
      
      if (!eventId) {
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('modalidades')
          .select('id, nome, categoria, tipo_modalidade')
          .eq('evento_id', eventId)
          .eq('tipo_modalidade', 'coletivo')
          .order('nome');
        
        if (error) {
          console.error('Error fetching modalities:', error);
          return [];
        }
        
        if (!data) {
          return [];
        }
        
        const formattedModalities = data.map((item) => ({
          modalidade_id: item.id,
          modalidade_nome: item.nome,
          categoria: item.categoria || '',
          tipo_modalidade: item.tipo_modalidade
        }));
        
        console.log('Modalities fetched:', formattedModalities);
        return formattedModalities;
      } catch (error) {
        console.error('Error fetching modalities:', error);
        return [];
      }
    },
    enabled: !!eventId,
  });

  return { modalities: modalities || [], isLoadingModalities };
}
