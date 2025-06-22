
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Branch {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
}

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('filiais')
        .select('id, nome, cidade, estado')
        .order('nome');

      if (error) {
        console.error('Error fetching branches:', error);
        throw error;
      }

      return data as Branch[];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
