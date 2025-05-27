
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useDeleteTeamMutation(
  eventId: string | null,
  selectedModalityId: number | null
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teamId: number) => {
      console.log('Deleting team:', teamId);

      // First, delete all athletes from the team
      const { error: athletesError } = await supabase
        .from('atletas_equipes')
        .delete()
        .eq('equipe_id', teamId);

      if (athletesError) {
        console.error('Error deleting team athletes:', athletesError);
        throw new Error('Erro ao remover atletas da equipe');
      }

      // Then delete the team itself
      const { error: teamError } = await supabase
        .from('equipes')
        .delete()
        .eq('id', teamId);

      if (teamError) {
        console.error('Error deleting team:', teamError);
        throw new Error('Erro ao excluir equipe');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['teams-data', eventId, selectedModalityId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['available-athletes', eventId, selectedModalityId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['all-teams', eventId] 
      });
      toast.success('Equipe excluída com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir equipe: ' + error.message);
    }
  });
}
