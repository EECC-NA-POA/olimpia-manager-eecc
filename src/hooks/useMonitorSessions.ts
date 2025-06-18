
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface MonitorSession {
  id: string;
  modalidade_rep_id: string;
  data_hora_inicio: string;
  data_hora_fim: string | null;
  descricao: string;
  criado_em: string;
  criado_por: string;
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

      // Primeiro, buscar informações da modalidade para obter modalidade_id
      const { data: modalidadeRepData, error: modalidadeRepError } = await supabase
        .from('modalidade_representantes')
        .select('modalidade_id')
        .eq('id', modalidadeRepId)
        .single();

      if (modalidadeRepError) {
        console.error('Error fetching modalidade_rep data:', modalidadeRepError);
        throw modalidadeRepError;
      }

      if (!modalidadeRepData) {
        console.log('No modalidade_rep data found');
        return [];
      }

      console.log('Found modalidade_id:', modalidadeRepData.modalidade_id);

      // Buscar todos os representantes desta modalidade
      const { data: allRepsData, error: allRepsError } = await supabase
        .from('modalidade_representantes')
        .select('id')
        .eq('modalidade_id', modalidadeRepData.modalidade_id);

      if (allRepsError) {
        console.error('Error fetching all reps:', allRepsError);
        throw allRepsError;
      }

      if (!allRepsData || allRepsData.length === 0) {
        console.log('No representatives found for this modality');
        return [];
      }

      const allRepIds = allRepsData.map(rep => rep.id);
      console.log('All representative IDs for this modality:', allRepIds);

      // Buscar todas as chamadas de todos os representantes desta modalidade
      const { data: sessions, error } = await supabase
        .from('chamadas')
        .select(`
          *,
          modalidade_representantes!modalidade_rep_id (
            modalidades!modalidade_representantes_modalidade_id_fkey (nome),
            filiais!modalidade_representantes_filial_id_fkey (nome)
          )
        `)
        .in('modalidade_rep_id', allRepIds)
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
