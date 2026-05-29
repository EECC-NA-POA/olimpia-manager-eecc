import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ModalityStats {
  modalidade_nome: string;
  total_sessions: number;
  total_eligible: number;   // total registros de presença
  presentes: number;
  atrasados: number;
  ausentes: number;
  taxa: number;             // (presentes + atrasados) / eligible * 100
}

export interface SessionPoint {
  date: string;             // dd/MM
  dateISO: string;
  modalidade: string;
  presentes: number;
  atrasados: number;
  ausentes: number;
  total: number;
  taxa: number;
}

export interface AthleteAlert {
  atleta_id: string;
  nome: string;
  presentes: number;
  atrasados: number;
  ausentes: number;
  total_sessions: number;
  taxa: number;
}

export interface MonitorReportsData {
  totalSessions: number;
  totalEligible: number;
  totalPresentes: number;
  totalAtrasados: number;
  totalAusentes: number;
  taxaGeral: number;
  lastSession: string | null;
  modalityStats: ModalityStats[];
  sessionTimeline: SessionPoint[];   // all sessions ordered asc for charts
  athleteAlerts: AthleteAlert[];     // athletes with taxa < 60%, worst first
}

export function useMonitorReports() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['monitor-reports', user?.id],
    queryFn: async (): Promise<MonitorReportsData> => {
      if (!user?.id) throw new Error('User not authenticated');

      const empty: MonitorReportsData = {
        totalSessions: 0, totalEligible: 0,
        totalPresentes: 0, totalAtrasados: 0, totalAusentes: 0,
        taxaGeral: 0, lastSession: null,
        modalityStats: [], sessionTimeline: [], athleteAlerts: []
      };

      // 1. Modalidade reps for this monitor
      const { data: reps, error: repsErr } = await supabase
        .from('modalidade_representantes')
        .select('id, modalidade_id, modalidades!modalidade_representantes_modalidade_id_fkey(nome)')
        .eq('atleta_id', user.id);

      if (repsErr) throw repsErr;
      if (!reps?.length) return empty;

      // All reps for same modalities (to catch sessions created by other monitors of same modality)
      const modIds = reps.map(r => String(r.modalidade_id));
      const { data: allReps } = await supabase
        .from('modalidade_representantes')
        .select('id, modalidade_id, modalidades!modalidade_representantes_modalidade_id_fkey(nome)')
        .in('modalidade_id', modIds);

      const allRepIds = (allReps ?? reps).map(r => r.id);

      // 2. Sessions (no presença join — fetch separately)
      const { data: sessions, error: sessErr } = await supabase
        .from('chamadas')
        .select(`
          id,
          data_hora_inicio,
          data_hora_fim,
          modalidade_rep_id,
          modalidade_representantes!modalidade_rep_id(
            modalidades!modalidade_representantes_modalidade_id_fkey(nome)
          )
        `)
        .in('modalidade_rep_id', allRepIds)
        .order('data_hora_inicio', { ascending: true });

      if (sessErr) throw sessErr;
      if (!sessions?.length) return empty;

      const sessionIds = sessions.map(s => s.id);

      // 3. Presences — separate query
      const { data: presencas, error: presErr } = await supabase
        .from('chamada_presencas')
        .select('chamada_id, atleta_id, status')
        .in('chamada_id', sessionIds);

      if (presErr) throw presErr;

      // Group presences by session
      const presencasBySession = new Map<string, { atleta_id: string; status: string }[]>();
      for (const p of presencas ?? []) {
        if (!presencasBySession.has(p.chamada_id)) presencasBySession.set(p.chamada_id, []);
        presencasBySession.get(p.chamada_id)!.push(p);
      }

      // 4. Athlete names
      const allAthleteIds = [...new Set((presencas ?? []).map(p => p.atleta_id))];
      const athleteNames = new Map<string, string>();
      if (allAthleteIds.length > 0) {
        const { data: users } = await supabase
          .from('usuarios')
          .select('id, nome_completo')
          .in('id', allAthleteIds);
        (users ?? []).forEach(u => athleteNames.set(u.id, u.nome_completo));
      }

      // ── Aggregate ──────────────────────────────────────────────

      let totalPresentes = 0, totalAtrasados = 0, totalAusentes = 0;

      // Per-modality
      const modMap = new Map<string, ModalityStats>();
      // Per-athlete
      const athleteMap = new Map<string, AthleteAlert>();

      const timeline: SessionPoint[] = [];

      sessions.forEach(session => {
        const nome = (session.modalidade_representantes as any)?.modalidades?.nome ?? 'Desconhecida';
        const presencas = presencasBySession.get(session.id) ?? [];

        let sp = 0, sa = 0, su = 0;
        presencas.forEach(p => {
          if (p.status === 'presente')  { sp++; totalPresentes++; }
          else if (p.status === 'atrasado') { sa++; totalAtrasados++; }
          else { su++; totalAusentes++; }

          // athlete map
          const id = p.atleta_id;
          const nomAtleta = athleteNames.get(id) ?? 'Atleta';
          if (!athleteMap.has(id)) athleteMap.set(id, { atleta_id: id, nome: nomAtleta, presentes: 0, atrasados: 0, ausentes: 0, total_sessions: 0, taxa: 0 });
          const a = athleteMap.get(id)!;
          if (p.status === 'presente')  a.presentes++;
          else if (p.status === 'atrasado') a.atrasados++;
          else a.ausentes++;
          a.total_sessions++;
        });

        const total = presencas.length;
        const taxa = total > 0 ? Math.round(((sp + sa) / total) * 100) : 0;

        // timeline point
        timeline.push({
          date: format(new Date(session.data_hora_inicio), 'dd/MM', { locale: ptBR }),
          dateISO: session.data_hora_inicio,
          modalidade: nome,
          presentes: sp, atrasados: sa, ausentes: su,
          total, taxa,
        });

        // modality stats
        if (!modMap.has(nome)) modMap.set(nome, { modalidade_nome: nome, total_sessions: 0, total_eligible: 0, presentes: 0, atrasados: 0, ausentes: 0, taxa: 0 });
        const ms = modMap.get(nome)!;
        ms.total_sessions++;
        ms.total_eligible += total;
        ms.presentes += sp;
        ms.atrasados += sa;
        ms.ausentes += su;
      });

      // Finalise modality rates
      const modalityStats: ModalityStats[] = Array.from(modMap.values()).map(ms => ({
        ...ms,
        taxa: ms.total_eligible > 0 ? Math.round(((ms.presentes + ms.atrasados) / ms.total_eligible) * 100) : 0
      }));

      // Finalise athlete rates & filter alerts (taxa < 60, min 1 session)
      const athleteAlerts: AthleteAlert[] = Array.from(athleteMap.values())
        .map(a => ({ ...a, taxa: a.total_sessions > 0 ? Math.round(((a.presentes + a.atrasados) / a.total_sessions) * 100) : 0 }))
        .filter(a => a.taxa < 60 && a.total_sessions >= 1)
        .sort((a, b) => a.taxa - b.taxa)
        .slice(0, 10);

      const totalEligible = totalPresentes + totalAtrasados + totalAusentes;
      const taxaGeral = totalEligible > 0 ? Math.round(((totalPresentes + totalAtrasados) / totalEligible) * 100) : 0;
      const lastSession = sessions[sessions.length - 1]?.data_hora_inicio ?? null;

      return {
        totalSessions: sessions.length,
        totalEligible,
        totalPresentes,
        totalAtrasados,
        totalAusentes,
        taxaGeral,
        lastSession,
        modalityStats,
        sessionTimeline: timeline,
        athleteAlerts,
      };
    },
    enabled: !!user?.id,
    staleTime: 0,
  });
}
