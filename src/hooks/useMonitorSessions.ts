
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
      
      if (!modalidadeRepId) {
        console.log('No modalidade_rep_id provided, returning empty array');
        return [];
      }

      // Buscar as chamadas com join explícito usando o relacionamento correto
      const { data: sessions, error } = await supabase
        .from('chamadas')
        .select(`
          *,
          modalidade_representantes (
            modalidades!modalidade_representantes_modalidade_id_fkey (nome),
            filiais (nome)
          )
        `)
        .eq('modalidade_rep_id', modalidadeRepId)
        .order('data_hora_inicio', { ascending: false });

      if (error) {
        console.error('Error fetching monitor sessions:', error);
        throw error;
      }

      console.log('Sessions with modalidade data:', sessions);
      return sessions as MonitorSession[];
    },
    enabled: !!modalidadeRepId,
  });
};
