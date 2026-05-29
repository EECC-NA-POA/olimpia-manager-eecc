import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useMonitorModalities } from "./useMonitorModalities";
import { MonitorSession } from "./useMonitorSessions";

/**
 * Fetches ALL chamadas across ALL modalities assigned to the current monitor.
 * No modality pre-selection required — shows the full history upfront.
 */
export const useAllMonitorSessions = () => {
  const { data: modalities, isLoading: modalitiesLoading } = useMonitorModalities();

  const modalidadeIds = (modalities ?? [])
    .map(m => String(m.modalidade_id))
    .filter(Boolean);

  return useQuery({
    queryKey: ['all-monitor-sessions', modalidadeIds.join(',')],
    queryFn: async (): Promise<MonitorSession[]> => {
      if (modalidadeIds.length === 0) return [];

      // All rep IDs for all modalities assigned to this monitor
      const { data: allReps, error: repsErr } = await supabase
        .from('modalidade_representantes')
        .select('id')
        .in('modalidade_id', modalidadeIds);

      if (repsErr) throw repsErr;
      if (!allReps?.length) return [];

      const allRepIds = allReps.map(r => r.id);

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

      if (error) throw error;
      return (sessions ?? []) as MonitorSession[];
    },
    enabled: modalidadeIds.length > 0,
    staleTime: 0,
  });
};
