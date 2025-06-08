
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ModeloModalidade, CampoModelo } from '@/types/dynamicScoring';

export function useModelosModalidade(modalidadeId?: number) {
  return useQuery({
    queryKey: ['modelos-modalidade', modalidadeId],
    queryFn: async () => {
      let query = supabase
        .from('modelos_modalidade')
        .select('*')
        .order('criado_em', { ascending: false });
      
      if (modalidadeId) {
        query = query.eq('modalidade_id', modalidadeId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as ModeloModalidade[];
    },
    enabled: true
  });
}

export function useCamposModelo(modeloId?: number) {
  return useQuery({
    queryKey: ['campos-modelo', modeloId],
    queryFn: async () => {
      if (!modeloId) return [];
      
      const { data, error } = await supabase
        .from('campos_modelo')
        .select('*')
        .eq('modelo_id', modeloId)
        .order('ordem_exibicao');
      
      if (error) throw error;
      return data as CampoModelo[];
    },
    enabled: !!modeloId
  });
}

export function useCreateModelo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<ModeloModalidade, 'id' | 'criado_em' | 'atualizado_em'>) => {
      const { data: result, error } = await supabase
        .from('modelos_modalidade')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelos-modalidade'] });
      toast.success('Modelo criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating modelo:', error);
      toast.error('Erro ao criar modelo');
    }
  });
}

export function useUpdateModelo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ModeloModalidade> & { id: number }) => {
      const { data: result, error } = await supabase
        .from('modelos_modalidade')
        .update({ ...data, atualizado_em: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelos-modalidade'] });
      toast.success('Modelo atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating modelo:', error);
      toast.error('Erro ao atualizar modelo');
    }
  });
}

export function useDeleteModelo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('modelos_modalidade')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelos-modalidade'] });
      toast.success('Modelo excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting modelo:', error);
      toast.error('Erro ao excluir modelo');
    }
  });
}

export function useCreateCampo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<CampoModelo, 'id'>) => {
      const { data: result, error } = await supabase
        .from('campos_modelo')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campos-modelo', variables.modelo_id] });
      toast.success('Campo criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating campo:', error);
      toast.error('Erro ao criar campo');
    }
  });
}

export function useUpdateCampo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, modelo_id, ...data }: Partial<CampoModelo> & { id: number; modelo_id: number }) => {
      const { data: result, error } = await supabase
        .from('campos_modelo')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campos-modelo', variables.modelo_id] });
      toast.success('Campo atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating campo:', error);
      toast.error('Erro ao atualizar campo');
    }
  });
}

export function useDeleteCampo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, modelo_id }: { id: number; modelo_id: number }) => {
      const { error } = await supabase
        .from('campos_modelo')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campos-modelo', variables.modelo_id] });
      toast.success('Campo excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting campo:', error);
      toast.error('Erro ao excluir campo');
    }
  });
}
