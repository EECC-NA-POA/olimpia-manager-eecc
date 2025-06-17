
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
      if (!user?.id || !currentEventId) {
        throw new Error('Usuário não autenticado ou evento não selecionado');
      }

      console.log('Creating session with data:', sessionData);

      const { data: chamada, error: chamadaError } = await supabase
        .from('chamadas')
        .insert({
          modalidade_rep_id: sessionData.modalidade_rep_id,
          data_hora_inicio: sessionData.data_hora_inicio,
          data_hora_fim: sessionData.data_hora_fim,
          descricao: sessionData.descricao,
          criado_por: user.id
        })
        .select()
        .single();

      if (chamadaError) {
        console.error('Error creating session:', chamadaError);
        throw new Error(`Erro ao criar chamada: ${chamadaError.message}`);
      }

      console.log('Session created successfully:', chamada);
      return chamada;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitor-sessions'] });
      toast.success('Chamada criada com sucesso! Agora você pode marcar as presenças.');
    },
    onError: (error: any) => {
      console.error('Error creating session:', error);
      toast.error(error.message || 'Erro ao criar chamada');
    }
  });

  const createSessionWithAttendance = useMutation({
    mutationFn: async (data: CreateSessionWithAttendanceData) => {
      if (!user?.id || !currentEventId) {
        throw new Error('Usuário não autenticado ou evento não selecionado');
      }

      console.log('Creating session with attendance:', data);

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

      if (chamadaError) {
        console.error('Error creating session:', chamadaError);
        throw new Error(`Erro ao criar chamada: ${chamadaError.message}`);
      }

      console.log('Session created, now creating attendances...');

      // Depois criar as presenças se houver
      if (data.attendances && data.attendances.length > 0) {
        const attendanceRecords = data.attendances.map(attendance => ({
          chamada_id: chamada.id,
          atleta_id: attendance.atleta_id,
          status: attendance.status,
          registrado_por: user.id
        }));

        console.log('Inserting attendance records:', attendanceRecords);

        const { error: attendanceError } = await supabase
          .from('chamada_presencas')
          .insert(attendanceRecords);

        if (attendanceError) {
          console.error('Error creating attendances:', attendanceError);
          // Se houver erro nas presenças, tentar deletar a chamada criada
          await supabase.from('chamadas').delete().eq('id', chamada.id);
          throw new Error(`Erro ao registrar presenças: ${attendanceError.message}`);
        }

        console.log('Attendances created successfully');
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
      toast.error(error.message || 'Erro ao criar chamada');
    }
  });

  const updateSession = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateSessionData> }) => {
      console.log('Updating session:', id, data);

      const { error } = await supabase
        .from('chamadas')
        .update({
          ...data,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating session:', error);
        throw new Error(`Erro ao atualizar chamada: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitor-sessions'] });
      toast.success('Chamada atualizada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error updating session:', error);
      toast.error(error.message || 'Erro ao atualizar chamada');
    }
  });

  const deleteSession = useMutation({
    mutationFn: async (sessionId: string) => {
      console.log('Deleting session:', sessionId);

      // Primeiro deletar as presenças relacionadas
      const { error: presencasError } = await supabase
        .from('chamada_presencas')
        .delete()
        .eq('chamada_id', sessionId);

      if (presencasError) {
        console.error('Error deleting attendances:', presencasError);
        throw new Error(`Erro ao deletar presenças: ${presencasError.message}`);
      }

      // Depois deletar a chamada
      const { error: chamadaError } = await supabase
        .from('chamadas')
        .delete()
        .eq('id', sessionId);

      if (chamadaError) {
        console.error('Error deleting session:', chamadaError);
        throw new Error(`Erro ao deletar chamada: ${chamadaError.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitor-sessions'] });
      toast.success('Chamada excluída com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error deleting session:', error);
      toast.error(error.message || 'Erro ao excluir chamada');
    }
  });

  const saveAttendances = useMutation({
    mutationFn: async (attendances: SaveAttendanceData[]) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Saving attendances:', attendances);

      // Primeiro, deletar presenças existentes para esta chamada
      const chamadaId = attendances[0]?.chamada_id;
      if (chamadaId) {
        const { error: deleteError } = await supabase
          .from('chamada_presencas')
          .delete()
          .eq('chamada_id', chamadaId);

        if (deleteError) {
          console.error('Error deleting existing attendances:', deleteError);
          throw new Error(`Erro ao remover presenças existentes: ${deleteError.message}`);
        }
      }

      // Depois inserir as novas presenças
      const attendancesToInsert = attendances.map(attendance => ({
        chamada_id: attendance.chamada_id,
        atleta_id: attendance.atleta_id,
        status: attendance.status,
        registrado_por: user.id
      }));

      const { error: insertError } = await supabase
        .from('chamada_presencas')
        .insert(attendancesToInsert);

      if (insertError) {
        console.error('Error inserting new attendances:', insertError);
        throw new Error(`Erro ao salvar presenças: ${insertError.message}`);
      }

      console.log('Attendances saved successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-attendance'] });
      toast.success('Presenças salvas com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error saving attendances:', error);
      toast.error(error.message || 'Erro ao salvar presenças');
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
