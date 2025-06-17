
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

      const { data, error } = await supabase
        .from('chamadas')
        .insert({
          ...sessionData,
          criado_por: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitor-sessions'] });
      toast.success('Sessão criada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error creating session:', error);
      toast.error('Erro ao criar sessão: ' + error.message);
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
      toast.success('Sessão atualizada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error updating session:', error);
      toast.error('Erro ao atualizar sessão: ' + error.message);
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
      toast.success('Sessão excluída com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error deleting session:', error);
      toast.error('Erro ao excluir sessão: ' + error.message);
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
