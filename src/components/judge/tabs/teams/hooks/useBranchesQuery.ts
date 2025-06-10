
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Branch {
  id: string;
  nome: string;
}

export function useBranchesQuery(eventId: string | null, userBranchId?: string) {
  return useQuery({
    queryKey: ['all-branches', eventId, userBranchId],
    queryFn: async (): Promise<Branch[]> => {
      if (!eventId) return [];

      let query = supabase
        .from('filiais')
        .select('id, nome')
        .order('nome');

      // If userBranchId is provided and it's not a special case, filter to show only that branch
      // For organizers, userBranchId should be undefined to show all branches
      if (userBranchId && userBranchId !== 'all') {
        query = query.eq('id', userBranchId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!eventId,
  });
}
