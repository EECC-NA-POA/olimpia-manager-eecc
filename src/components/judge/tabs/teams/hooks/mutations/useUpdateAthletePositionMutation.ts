
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useUpdateAthletePositionMutation(
  eventId: string | null,
  selectedModalityId: number | null
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ athleteTeamId, posicao, raia }: { athleteTeamId: number; posicao?: number; raia?: number }) => {
      const updateData: any = {};
      if (posicao !== undefined) updateData.posicao = posicao;
      if (raia !== undefined) updateData.raia = raia;

      const { error } = await supabase
        .from('atletas_equipes')
        .update(updateData)
        .eq('id', athleteTeamId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['teams-data', eventId, selectedModalityId] 
      });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar atleta: ' + error.message);
    }
  });
}
