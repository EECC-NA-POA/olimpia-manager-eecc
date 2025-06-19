
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useSessionDetail = (sessionId: string) => {
  return useQuery({
    queryKey: ['session-detail', sessionId],
    queryFn: async () => {
      console.log('Fetching session details for:', sessionId);
      
      const { data, error } = await supabase
        .from('chamadas')
        .select(`
          *,
          modalidade_representantes!modalidade_rep_id (
            modalidades!modalidade_representantes_modalidade_id_fkey (nome),
            filiais!modalidade_representantes_filial_id_fkey (nome)
          )
        `)
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('Error fetching session:', error);
        throw error;
      }

      console.log('Session data loaded:', data);
      return data;
    },
    enabled: !!sessionId,
  });
};
