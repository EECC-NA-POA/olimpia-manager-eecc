
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useRemoveAthleteMutation(
  eventId: string | null,
  selectedModalityId: number | null,
  isOrganizer: boolean
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (athleteTeamId: number) => {
      console.log('Removing athlete from team:', athleteTeamId, 'isOrganizer:', isOrganizer);

      // Organizers can remove any athlete from any team
      const { error } = await supabase
        .from('atletas_equipes')
        .delete()
        .eq('id', athleteTeamId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate all related queries with consistent keys
      queryClient.invalidateQueries({ 
        queryKey: ['teams-data', eventId, selectedModalityId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['available-athletes', eventId, selectedModalityId] 
      });
      // Also invalidate the all teams view
      queryClient.invalidateQueries({ 
        queryKey: ['all-teams', eventId] 
      });
      toast.success('Atleta removido da equipe!');
    },
    onError: (error) => {
      toast.error('Erro ao remover atleta: ' + error.message);
    }
  });
}
