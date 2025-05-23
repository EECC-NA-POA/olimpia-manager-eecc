
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Modality } from '../types';

export function useModalities(eventId: string | null) {
  // Fetch modalities with simplified type handling
  const { data: modalities, isLoading: isLoadingModalities } = useQuery({
    queryKey: ['modalities', eventId],
    queryFn: async () => {
      try {
        // Get all modalities for the event that are collective
        const { data, error } = await supabase
          .from('modalidades')
          .select('id, nome, categoria, tipo_modalidade')
          .eq('evento_id', eventId!)
          .eq('tipo_modalidade', 'coletivo')
          .order('nome');
        
        if (error) {
          console.error('Error fetching collective modalities:', error);
          toast.error('Não foi possível carregar as modalidades coletivas');
          return [] as Modality[];
        }
        
        console.log('Fetched collective modalities:', data);
        
        // Map to the expected format with proper null checking
        const formattedModalities: Modality[] = (data || []).map(item => ({
          modalidade_id: item.id || 0,
          modalidade_nome: item.nome || '',
          categoria: item.categoria || '',
          tipo_modalidade: item.tipo_modalidade || 'coletivo'
        }));
        
        return formattedModalities;
      } catch (error) {
        console.error('Error in modalities query:', error);
        toast.error('Erro ao buscar modalidades');
        return [] as Modality[];
      }
    },
    enabled: !!eventId,
  });

  return { modalities: modalities || [], isLoadingModalities };
}
