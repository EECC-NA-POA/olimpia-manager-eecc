import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface ModalityStats {
  modalidade_nome: string;
  total_sessions: number;
  total_attendees: number;
  total_presences: number;
  attendance_rate: number;
}

export interface RecentActivity {
  id: string;
  data_hora_inicio: string;
  data_hora_fim: string | null;
  modalidade_nome: string;
  total_atletas: number;
  total_presentes: number;
  created_at: string;
}

export interface MonitorReportsData {
  totalSessions: number;
  totalAttendees: number;
  totalPresences: number;
  averageAttendance: number;
  lastSession: string | null;
  modalityStats: ModalityStats[];
  recentActivities: RecentActivity[];
}

export function useMonitorReports() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['monitor-reports', user?.id],
    queryFn: async (): Promise<MonitorReportsData> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('useMonitorReports: Starting query for user:', user.id);

      // Get monitor's modality representative IDs
      const { data: modalidadeReps, error: repsError } = await supabase
        .from('modalidade_representantes')
        .select('id, modalidade_id, modalidades!modalidade_representantes_modalidade_id_fkey(nome)')
        .eq('atleta_id', user.id);

      if (repsError) {
        console.error('useMonitorReports: Error fetching modalidade reps:', repsError);
        throw repsError;
      }

      console.log('useMonitorReports: Found modalidade reps:', modalidadeReps);

      if (!modalidadeReps || modalidadeReps.length === 0) {
        return {
          totalSessions: 0,
          totalAttendees: 0,
          totalPresences: 0,
          averageAttendance: 0,
          lastSession: null,
          modalityStats: [],
          recentActivities: []
        };
      }

      const modalidadeRepIds = modalidadeReps.map(rep => rep.id);

      // Get all sessions for this monitor
      const { data: sessions, error: sessionsError } = await supabase
        .from('chamadas')
        .select(`
          id,
          data_hora_inicio,
          data_hora_fim,
          modalidade_rep_id,
          modalidade_representantes!inner(
            modalidades!modalidade_representantes_modalidade_id_fkey(nome)
          ),
          chamada_presencas(
            id,
            status
          )
        `)
        .in('modalidade_rep_id', modalidadeRepIds)
        .order('data_hora_inicio', { ascending: false });

      if (sessionsError) {
        console.error('useMonitorReports: Error fetching sessions:', sessionsError);
        throw sessionsError;
      }

      console.log('useMonitorReports: Found sessions:', sessions);

      if (!sessions || sessions.length === 0) {
        return {
          totalSessions: 0,
          totalAttendees: 0,
          totalPresences: 0,
          averageAttendance: 0,
          lastSession: null,
          modalityStats: [],
          recentActivities: []
        };
      }

      // Calculate general statistics
      const totalSessions = sessions.length;
      let totalPresences = 0;
      let totalAttendees = 0;

      sessions.forEach(session => {
        const presences = session.chamada_presencas || [];
        totalAttendees += presences.length;
        totalPresences += presences.filter(p => p.status === 'presente').length;
      });

      const averageAttendance = totalAttendees > 0 ? Math.round((totalPresences / totalAttendees) * 100) : 0;
      const lastSession = sessions.length > 0 ? sessions[0].data_hora_inicio : null;

      // Calculate statistics by modality
      const modalityStatsMap = new Map<string, {
        modalidade_nome: string;
        total_sessions: number;
        total_attendees: number;
        total_presences: number;
      }>();

      sessions.forEach(session => {
        const modalidadeName = (session.modalidade_representantes as any)?.modalidades?.nome || 'Desconhecida';
        const presences = session.chamada_presencas || [];
        const presentCount = presences.filter(p => p.status === 'presente').length;

        if (!modalityStatsMap.has(modalidadeName)) {
          modalityStatsMap.set(modalidadeName, {
            modalidade_nome: modalidadeName,
            total_sessions: 0,
            total_attendees: 0,
            total_presences: 0
          });
        }

        const stats = modalityStatsMap.get(modalidadeName)!;
        stats.total_sessions += 1;
        stats.total_attendees += presences.length;
        stats.total_presences += presentCount;
      });

      const modalityStats: ModalityStats[] = Array.from(modalityStatsMap.values()).map(stats => ({
        ...stats,
        attendance_rate: stats.total_attendees > 0 ? Math.round((stats.total_presences / stats.total_attendees) * 100) : 0
      }));

      // Recent activities (last 10 sessions)
      const recentActivities: RecentActivity[] = sessions.slice(0, 10).map(session => {
        const presences = session.chamada_presencas || [];
        return {
          id: session.id,
          data_hora_inicio: session.data_hora_inicio,
          data_hora_fim: session.data_hora_fim,
          modalidade_nome: (session.modalidade_representantes as any)?.modalidades?.nome || 'Desconhecida',
          total_atletas: presences.length,
          total_presentes: presences.filter(p => p.status === 'presente').length,
          created_at: session.data_hora_inicio
        };
      });

      return {
        totalSessions,
        totalAttendees,
        totalPresences,
        averageAttendance,
        lastSession,
        modalityStats,
        recentActivities
      };
    },
    enabled: !!user?.id
  });
}