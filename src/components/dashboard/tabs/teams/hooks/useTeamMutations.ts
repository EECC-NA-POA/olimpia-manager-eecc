
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { TeamFormData } from './useTeamOperations';

export function useTeamMutations(eventId: string | null, branchId?: string, editingTeam?: any) {
  const queryClient = useQueryClient();

  // Mutation to create/update team
  const teamMutation = useMutation({
    mutationFn: async (teamData: TeamFormData) => {
      const formattedData = {
        ...teamData,
        modalidade_id: parseInt(teamData.modalidade_id),
      };
      
      if (editingTeam) {
        // Update existing team
        const { data, error } = await supabase
          .from('equipes')
          .update(formattedData)
          .eq('id', editingTeam.id)
          .select();
        
        if (error) throw error;
        return data;
      } else {
        // Create new team
        const { data, error } = await supabase
          .from('equipes')
          .insert([{ ...formattedData, evento_id: eventId, filial_id: branchId }])
          .select();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', eventId, branchId] });
      toast.success(editingTeam ? 'Equipe atualizada com sucesso!' : 'Equipe criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message || 'Não foi possível salvar a equipe'}`);
    }
  });

  // Mutation to delete a team
  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: number) => {
      const { error } = await supabase
        .from('equipes')
        .delete()
        .eq('id', teamId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', eventId, branchId] });
      toast.success('Equipe excluída com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir equipe: ${error.message}`);
    }
  });

  return {
    teamMutation,
    deleteTeamMutation
  };
}
