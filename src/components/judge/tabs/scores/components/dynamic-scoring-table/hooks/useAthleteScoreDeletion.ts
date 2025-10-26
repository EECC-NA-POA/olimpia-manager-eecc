
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface DeleteAthleteScoresParams {
  athleteId: string;
  modalityId: number;
  eventId: string;
  bateriaId?: number | null;
}

export function useAthleteScoreDeletion() {
  const queryClient = useQueryClient();

  const deleteScoresMutation = useMutation({
    mutationFn: async ({ athleteId, modalityId, eventId, bateriaId }: DeleteAthleteScoresParams) => {
      console.log('=== DELETING ATHLETE SCORES ===');
      console.log('Athlete ID:', athleteId);
      console.log('Modality ID:', modalityId);
      console.log('Event ID:', eventId);
      console.log('Bateria ID:', bateriaId);

      // Build the delete query - Note: numero_bateria does not exist in pontuacoes table
      const { error } = await supabase
        .from('pontuacoes')
        .delete()
        .eq('atleta_id', athleteId)
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId);

      if (error) {
        console.error('Error deleting scores:', error);
        throw error;
      }

      console.log('Scores deleted successfully');
    },
    onSuccess: (_, { modalityId, eventId }) => {
      // Invalidate related queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['dynamic-scores', modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['athlete-scores', modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['dynamic-baterias', modalityId, eventId] });
      
      toast.success('Pontuações do atleta removidas com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error deleting athlete scores:', error);
      toast.error('Erro ao remover pontuações: ' + (error.message || 'Erro desconhecido'));
    },
  });

  return {
    deleteScores: deleteScoresMutation.mutateAsync,
    isDeleting: deleteScoresMutation.isPending
  };
}
