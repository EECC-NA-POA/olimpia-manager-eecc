import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { MonitorSession } from "./useMonitorSessions";

/**
 * Fetches ALL chamadas across ALL modalities of the current event.
 * Used by Organizers who should see the full attendance history.
 */
export const useEventSessions = () => {
  const { currentEventId } = useAuth();

  return useQuery({
    queryKey: ['event-sessions', currentEventId],
    queryFn: async (): Promise<MonitorSession[]> => {
      if (!currentEventId) return [];

      // Get all modalidade_representantes for modalities in this event
      const { data: reps, error: repsErr } = await supabase
        .from('modalidade_representantes')
        .select('id, modalidades!inner(evento_id)')
        .eq('modalidades.evento_id', currentEventId);

      if (repsErr) throw repsErr;
      if (!reps?.length) return [];

      const repIds = reps.map(r => r.id);

      const { data: sessions, error } = await supabase
        .from('chamadas')
        .select(`
          *,
          modalidade_representantes!modalidade_rep_id (
            modalidades!modalidade_representantes_modalidade_id_fkey (nome),
            filiais!modalidade_representantes_filial_id_fkey (nome)
          )
        `)
        .in('modalidade_rep_id', repIds)
        .order('data_hora_inicio', { ascending: false });

      if (error) throw error;
      const list = (sessions ?? []) as MonitorSession[];
      if (!list.length) return list;

      // Resolve names for criado_por
      const userIds = [...new Set(list.map(s => s.criado_por).filter(Boolean))];
      const { data: users } = await supabase
        .from('usuarios')
        .select('id, nome_completo')
        .in('id', userIds);
      const nameMap = new Map((users ?? []).map(u => [u.id, u.nome_completo]));
      return list.map(s => ({ ...s, criador_nome: nameMap.get(s.criado_por) ?? undefined }));
    },
    enabled: !!currentEventId,
    staleTime: 0,
  });
};
