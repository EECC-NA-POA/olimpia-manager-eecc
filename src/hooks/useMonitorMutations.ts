
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface CreateSessionData {
  modalidade_rep_id: number;
  data_hora_inicio: string;
  data_hora_fim?: string;
  descricao: string;
}

export interface UpdateSessionData {
  id: number;
  data_hora_inicio?: string;
  data_hora_fim?: string;
  descricao?: string;
}

export interface AttendanceData {
  chamada_id: number;
  atleta_id: string;
  status: 'presente' | 'ausente' | 'atrasado';
  observacoes?: string;
}

export const useMonitorMutations = () => {
  const queryClient = useQueryClient();

  const createSession = useMutation({
    mutationFn: async (data: CreateSessionData) => {
      console.log('Creating session:', data);
      
      const { data: result, error } = await supabase
        .from('chamadas')
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitor-sessions'] });
      toast.success('Sessão criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating session:', error);
      toast.error('Erro ao criar sessão');
    },
  });

  const updateSession = useMutation({
    mutationFn: async (data: UpdateSessionData) => {
      console.log('Updating session:', data);
      
      const { id, ...updateData } = data;
      const { data: result, error } = await supabase
        .from('chamadas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating session:', error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitor-sessions'] });
      toast.success('Sessão atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating session:', error);
      toast.error('Erro ao atualizar sessão');
    },
  });

  const deleteSession = useMutation({
    mutationFn: async (sessionId: number) => {
      console.log('Deleting session:', sessionId);
      
      const { error } = await supabase
        .from('chamadas')
        .delete()
        .eq('id', sessionId);

      if (error) {
        console.error('Error deleting session:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitor-sessions'] });
      toast.success('Sessão excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting session:', error);
      toast.error('Erro ao excluir sessão');
    },
  });

  const saveAttendances = useMutation({
    mutationFn: async (attendances: AttendanceData[]) => {
      console.log('Saving attendances:', attendances);
      
      const { data, error } = await supabase
        .from('chamada_presencas')
        .upsert(attendances, {
          onConflict: 'chamada_id,atleta_id'
        });

      if (error) {
        console.error('Error saving attendances:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-attendance'] });
      toast.success('Presenças salvas com sucesso!');
    },
    onError: (error) => {
      console.error('Error saving attendances:', error);
      toast.error('Erro ao salvar presenças');
    },
  });

  return {
    createSession,
    updateSession,
    deleteSession,
    saveAttendances,
  };
};
