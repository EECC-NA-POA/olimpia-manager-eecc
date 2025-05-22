
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Modality } from '@/lib/types/database';

export function useModalities(eventId: string | null) {
  const { data: modalities, isLoading: isLoadingModalities } = useQuery({
    queryKey: ['modalities', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      // Get modalities with confirmed athlete enrollments
      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, categoria, tipo_modalidade, tipo_pontuacao')
        .eq('evento_id', eventId)
        .order('nome')
        .limit(100);
      
      if (error) {
        console.error('Error fetching modalities:', error);
        toast.error('Não foi possível carregar as modalidades');
        return [];
      }
      
      return data.map(m => ({
        modalidade_id: m.id,
        modalidade_nome: m.nome,
        categoria: m.categoria,
        tipo_modalidade: m.tipo_modalidade,
        tipo_pontuacao: m.tipo_pontuacao || 'points'
      })) as Modality[];
    },
    enabled: !!eventId,
  });

  return { modalities, isLoadingModalities };
}
