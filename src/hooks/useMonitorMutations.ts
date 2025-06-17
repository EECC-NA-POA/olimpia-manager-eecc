
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

interface CreateSessionWithAttendanceData extends CreateSessionData {
  attendances: Omit<SaveAttendanceData, 'chamada_id'>[];
}

export const useMonitorMutations = () => {
  const queryClient = useQueryClient();
  const { user, currentEventId } = useAuth();

  const createSession = useMutation({
    mutationFn: async (sessionData: CreateSessionData) => {
      if (!user?.id || !currentEventId) throw new Error('Usuário não autenticado ou evento não selecionado');

      // Apenas criar a chamada sem criar presenças automaticamente
      const { data: chamada, error: chamadaError } = await supabase
        .from('chamadas')
        .insert({
          ...sessionData,
          criado_por: user.id
        })
        .select()
        .single();

      if (chamadaError) throw chamadaError;

      return chamada;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitor-sessions'] });
      toast.success('Chamada criada com sucesso! Agora você pode marcar as presenças.');
    },
    onError: (error: any) => {
      console.error('Error creating session:', error);
      toast.error('Erro ao criar chamada: ' + error.message);
    }
  });

  const createSessionWithAttendance = useMutation({
    mutationFn: async (data: CreateSessionWithAttendanceData) => {
      if (!user?.id || !currentEventId) throw new Error('Usuário não autenticado ou evento não selecionado');

      // Primeiro criar a chamada
      const { data: chamada, error: chamadaError } = await supabase
        .from('chamadas')
        .insert({
          modalidade_rep_id: data.modalidade_rep_id,
          data_hora_inicio: data.data_hora_inicio,
          data_hora_fim: data.data_hora_fim,
          descricao: data.descricao,
          criado_por: user.id
        })
        .select()
        .single();

      if (chamadaError) throw chamadaError;

      // Depois criar as presenças
      if (data.attendances && data.attendances.length > 0) {
        const attendanceRecords = data.attendances.map(attendance => ({
          chamada_id: chamada.id,
          atleta_id: attendance.atleta_id,
          status: attendance.status,
          registrado_por: user.id
        }));

        const { error: attendanceError } = await supabase
          .from('chamada_presencas')
          .insert(attendanceRecords);

        if (attendanceError) {
          console.error('Error creating attendances:', attendanceError);
          // Se houver erro nas presenças, tentar deletar a chamada criada
          await supabase.from('chamadas').delete().eq('id', chamada.id);
          throw new Error('Erro ao registrar presenças: ' + attendanceError.message);
        }
      }

      return chamada;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitor-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session-attendance'] });
      toast.success('Chamada criada e presenças registradas com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error creating session with attendance:', error);
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
      // Primeiro deletar as presenças relacionadas
      await supabase
        .from('chamada_presencas')
        .delete()
        .eq('chamada_id', sessionId);

      // Depois deletar a chamada
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

      // Primeiro, deletar presenças existentes para esta chamada
      const chamadaId = attendances[0]?.chamada_id;
      if (chamadaId) {
        await supabase
          .from('chamada_presencas')
          .delete()
          .eq('chamada_id', chamadaId);
      }

      // Depois inserir as novas presenças
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
    createSessionWithAttendance,
    updateSession,
    deleteSession,
    saveAttendances
  };
};
