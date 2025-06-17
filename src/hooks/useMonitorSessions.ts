
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

      // Buscar as chamadas diretamente
      const { data: chamadas, error } = await supabase
        .from('chamadas')
        .select('*')
        .eq('modalidade_rep_id', modalidadeRepId)
        .order('data_hora_inicio', { ascending: false });

      if (error) {
        console.error('Error fetching monitor sessions:', error);
        throw error;
      }

      console.log('Chamadas found:', chamadas);

      if (!chamadas || chamadas.length === 0) {
        return [];
      }

      // Buscar dados da modalidade_representantes com uma query mais simples
      const { data: modalidadeRep, error: repError } = await supabase
        .from('modalidade_representantes')
        .select(`
          modalidades (nome),
          filiais (nome)
        `)
        .eq('id', modalidadeRepId)
        .single();

      if (repError) {
        console.error('Error fetching modalidade_representantes:', repError);
        throw repError;
      }

      console.log('Modalidade rep data:', modalidadeRep);

      // Combinar os dados com type assertion para resolver os tipos
      const transformedData = chamadas.map(chamada => ({
        ...chamada,
        modalidade_representantes: {
          modalidades: {
            nome: (modalidadeRep.modalidades as any)?.nome || 'N/A'
          },
          filiais: {
            nome: (modalidadeRep.filiais as any)?.nome || 'N/A'
          }
        }
      }));

      console.log('Final transformed sessions:', transformedData);
      return transformedData as MonitorSession[];
    },
    enabled: !!modalidadeRepId,
  });
};
