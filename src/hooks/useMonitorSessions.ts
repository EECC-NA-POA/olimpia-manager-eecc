
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface MonitorSession {
  id: number;
  modalidade_rep_id: number;
  data_hora_inicio: string;
  data_hora_fim: string | null;
  descricao: string;
  created_at: string;
  modalidade_representantes: {
    modalidades: {
      nome: string;
    };
    filiais: {
      nome: string;
    };
  };
}

export const useMonitorSessions = (modalidadeRepId?: number) => {
  return useQuery({
    queryKey: ['monitor-sessions', modalidadeRepId],
    queryFn: async () => {
      console.log('Fetching monitor sessions for modalidade_rep_id:', modalidadeRepId);
      
      let query = supabase
        .from('chamadas')
        .select(`
          id,
          modalidade_rep_id,
          data_hora_inicio,
          data_hora_fim,
          descricao,
          created_at,
          modalidade_representantes!inner (
            modalidades!inner (
              nome
            ),
            filiais!inner (
              nome
            )
          )
        `)
        .order('data_hora_inicio', { ascending: false });

      if (modalidadeRepId) {
        query = query.eq('modalidade_rep_id', modalidadeRepId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching monitor sessions:', error);
        throw error;
      }

      console.log('Monitor sessions data:', data);
      
      // Transform the data to match our interface
      const transformedData = data?.map(item => ({
        ...item,
        modalidade_representantes: {
          modalidades: Array.isArray(item.modalidade_representantes.modalidades) 
            ? item.modalidade_representantes.modalidades[0] 
            : item.modalidade_representantes.modalidades,
          filiais: Array.isArray(item.modalidade_representantes.filiais) 
            ? item.modalidade_representantes.filiais[0] 
            : item.modalidade_representantes.filiais
        }
      })) || [];

      return transformedData as MonitorSession[];
    },
    enabled: !!modalidadeRepId,
  });
};
