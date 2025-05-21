
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Modality } from '../types';

export function useModalities(eventId: string | null) {
  // Fetch modalities with simplified type handling
  const { data: modalities, isLoading: isLoadingModalities } = useQuery({
    queryKey: ['modalities', eventId],
    queryFn: async () => {
      if (!eventId) return [] as Modality[];
      
      // Get modalities with confirmed athlete enrollments
      const { data, error } = await supabase
        .from('vw_modalidades_atletas_confirmados')
        .select('modalidade_id, modalidade_nome, categoria, tipo_modalidade')
        .eq('evento_id', eventId)
        .order('modalidade_nome');
      
      if (error) {
        console.error('Error fetching modalities:', error);
        toast({
          title: "Erro",
          description: 'Não foi possível carregar as modalidades',
          variant: "destructive"
        });
        return [] as Modality[];
      }
      
      // Process unique modalities
      const uniqueModalitiesMap = new Map<number, Modality>();
      
      if (data && data.length > 0) {
        data.forEach(item => {
          uniqueModalitiesMap.set(item.modalidade_id, {
            modalidade_id: item.modalidade_id,
            modalidade_nome: item.modalidade_nome,
            categoria: item.categoria,
            tipo_modalidade: item.tipo_modalidade
          });
        });
      }
      
      // Convert map to array
      return Array.from(uniqueModalitiesMap.values());
    },
    enabled: !!eventId,
  });

  return { modalities, isLoadingModalities };
}
