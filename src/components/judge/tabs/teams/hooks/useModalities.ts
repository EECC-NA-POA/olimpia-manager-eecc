
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Simple interface to avoid type recursion
interface SimpleModalityData {
  id: number;
  nome: string;
  categoria: string;
  tipo_modalidade: string;
}

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
      console.log('Fetching collective modalities for event:', eventId);
      
      if (!eventId) {
        console.log('No eventId provided');
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
          console.error('Error fetching collective modalities:', error);
          toast.error('Não foi possível carregar as modalidades coletivas');
          return [];
        }
        
        console.log('Raw modalities data:', data);
        
        if (!data || data.length === 0) {
          console.log('No collective modalities found for this event');
          return [];
        }
        
        // Transform to expected format
        const formattedModalities: Modality[] = data.map((item: SimpleModalityData) => ({
          modalidade_id: item.id,
          modalidade_nome: item.nome,
          categoria: item.categoria || '',
          tipo_modalidade: item.tipo_modalidade
        }));
        
        console.log('Formatted modalities:', formattedModalities);
        return formattedModalities;
      } catch (error: any) {
        console.error('Exception in modalities query:', error);
        toast.error('Erro ao buscar modalidades coletivas');
        return [];
      }
    },
    enabled: !!eventId,
  });

  return { modalities: modalities || [], isLoadingModalities };
}
