
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface MonitorSession {
  id: string;
  modalidade_rep_id: string;
  data_hora_inicio: string;
  data_hora_fim: string | null;
  descricao: string;
  criado_em: string;
  modalidade_representantes: {
    modalidades: {
      nome: string;
    };
    filiais: {
      nome: string;
    };
  };
}

export const useMonitorSessions = (modalidadeRepId?: string) => {
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
          criado_em,
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
      const transformedData = data?.map(item => {
        // First extract the modalidade_representantes object from the array
        const modalidadeRep = Array.isArray(item.modalidade_representantes) 
          ? item.modalidade_representantes[0] 
          : item.modalidade_representantes;
        
        return {
          ...item,
          modalidade_representantes: {
            modalidades: Array.isArray(modalidadeRep.modalidades) 
              ? modalidadeRep.modalidades[0] 
              : modalidadeRep.modalidades,
            filiais: Array.isArray(modalidadeRep.filiais) 
              ? modalidadeRep.filiais[0] 
              : modalidadeRep.filiais
          }
        };
      }) || [];

      return transformedData as MonitorSession[];
    },
    enabled: !!modalidadeRepId,
  });
};
