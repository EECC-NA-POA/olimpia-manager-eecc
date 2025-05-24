
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Modality {
  modalidade_id: number;
  modalidade_nome: string;
  categoria: string;
  tipo_modalidade: string;
}

export function useModalities(eventId: string | null) {
  const { data: modalities, isLoading: isLoadingModalities } = useQuery({
    queryKey: ['collective-modalities', eventId],
    queryFn: async (): Promise<Modality[]> => {
      try {
        console.log('Fetching collective modalities for event:', eventId);
        
        if (!eventId) {
          return [];
        }

        // Get all modalities for the event that are collective
        const { data, error } = await supabase
          .from('modalidades')
          .select('id, nome, categoria, tipo_modalidade')
          .eq('evento_id', eventId)
          .eq('tipo_modalidade', 'coletivo')
          .order('nome');
        
        if (error) {
          console.error('Error fetching collective modalities:', error);
          toast.error('Não foi possível carregar as modalidades coletivas');
          return [];
        }
        
        console.log('Fetched collective modalities:', data);
        
        if (!data || data.length === 0) {
          console.log('No collective modalities found for this event');
          return [];
        }
        
        // Map to the expected format
        const formattedModalities: Modality[] = data.map(item => ({
          modalidade_id: item.id,
          modalidade_nome: item.nome,
          categoria: item.categoria || '',
          tipo_modalidade: item.tipo_modalidade
        }));
        
        return formattedModalities;
      } catch (error) {
        console.error('Error in modalities query:', error);
        toast.error('Erro ao buscar modalidades coletivas');
        return [];
      }
    },
    enabled: !!eventId,
  });

  return { modalities: modalities || [], isLoadingModalities };
}
