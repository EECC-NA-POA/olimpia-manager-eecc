
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Branch {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
}

export function useEventBranches(eventId: string | null) {
  return useQuery({
    queryKey: ['event-branches', eventId],
    queryFn: async () => {
      if (!eventId) {
        return [];
      }

      const { data, error } = await supabase
        .from('eventos_filiais')
        .select(`
          filial_id,
          filiais!inner(
            id,
            nome,
            cidade,
            estado
          )
        `)
        .eq('evento_id', eventId);

      if (error) {
        console.error('Error fetching event branches:', error);
        throw error;
      }

      // Transform data to match Branch interface
      const branches: Branch[] = (data || []).map(item => {
        const filial = item.filiais as any;
        return {
          id: filial.id,
          nome: filial.nome,
          cidade: filial.cidade,
          estado: filial.estado
        };
      });

      return branches;
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
