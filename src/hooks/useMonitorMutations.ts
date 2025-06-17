
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface CreateSessionData {
  modalidade_rep_id: string;
  data_hora_inicio: string;
  data_hora_fim?: string;
  descricao: string;
}

interface SaveAttendanceData {
  chamada_id: string;
  atleta_id: string;
  status: 'presente' | 'ausente' | 'atrasado';
}

export const useMonitorMutations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createSession = useMutation({
    mutationFn: async (sessionData: CreateSessionData) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Primeiro buscar os atletas inscritos na modalidade
      const { data: repData, error: repError } = await supabase
        .from('modalidade_representantes')
        .select('modalidade_id, filial_id, evento_id')
        .eq('id', sessionData.modalidade_rep_id)
        .single();

      if (repError) throw repError;

      const { data: athletesData, error: athletesError } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          atleta_id,
          usuarios!inner (id)
        `)
        .eq('modalidade_id', repData.modalidade_id)
        .eq('evento_id', repData.evento_id)
        .eq('status', 'confirmado');

      if (athletesError) throw athletesError;

      if (!athletesData || athletesData.length === 0) {
        throw new Error('Não há atletas inscritos nesta modalidade');
      }

      // Criar a chamada
      const { data: chamada, error: chamadaError } = await supabase
        .from('chamadas')
        .insert({
          ...sessionData,
          criado_por: user.id
        })
        .select()
        .single();

      if (chamadaError) throw chamadaError;

      // Criar registros de presença para todos os atletas (padrão: presente)
      const attendanceRecords = athletesData.map(item => {
        const atletaId = Array.isArray(item.usuarios) ? item.usuarios[0]?.id : item.usuarios?.id;
        return {
          chamada_id: chamada.id,
          atleta_id: atletaId,
          status: 'presente' as const,
          registrado_por: user.id
        };
      });

      const { error: attendanceError } = await supabase
        .from('chamada_presencas')
        .insert(attendanceRecords);

      if (attendanceError) throw attendanceError;

      return chamada;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitor-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session-attendance'] });
      toast.success('Chamada criada com sucesso! Todos os atletas foram marcados como presentes.');
    },
    onError: (error: any) => {
      console.error('Error creating session:', error);
      toast.error('Erro ao criar chamada: ' + error.message);
    }
  });

  const updateSession = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateSessionData> }) => {
      const { error } = await supabase
        .from('chamadas')
        .update({
          ...data,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitor-sessions'] });
      toast.success('Chamada atualizada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error updating session:', error);
      toast.error('Erro ao atualizar chamada: ' + error.message);
    }
  });

  const deleteSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('chamadas')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitor-sessions'] });
      toast.success('Chamada excluída com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error deleting session:', error);
      toast.error('Erro ao excluir chamada: ' + error.message);
    }
  });

  const saveAttendances = useMutation({
    mutationFn: async (attendances: SaveAttendanceData[]) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // First, delete existing attendances for this session
      const chamadaId = attendances[0]?.chamada_id;
      if (chamadaId) {
        await supabase
          .from('chamada_presencas')
          .delete()
          .eq('chamada_id', chamadaId);
      }

      // Then insert new attendances
      const attendancesToInsert = attendances.map(attendance => ({
        ...attendance,
        registrado_por: user.id
      }));

      const { error } = await supabase
        .from('chamada_presencas')
        .insert(attendancesToInsert);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-attendance'] });
      toast.success('Presenças salvas com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error saving attendances:', error);
      toast.error('Erro ao salvar presenças: ' + error.message);
    }
  });

  return {
    createSession,
    updateSession,
    deleteSession,
    saveAttendances
  };
};
