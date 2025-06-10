
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UseScoreMutationProps {
  athleteId: string;
  modalityId: number;
  eventId: string;
  judgeId: string;
}

export function useScoreMutation({ athleteId, modalityId, eventId, judgeId }: UseScoreMutationProps) {
  const queryClient = useQueryClient();

  const updateScoreMutation = useMutation({
    mutationFn: async ({ scoreId, newValues }: { scoreId: number, newValues: any }) => {
      console.log('Updating score:', scoreId, newValues);
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .update({
          ...newValues,
          juiz_id: judgeId,
          data_registro: new Date().toISOString()
        })
        .eq('id', scoreId)
        .select('*');
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bateria-scores', athleteId, modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['bateria-scores-check', athleteId, modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['scores', modalityId, eventId] });
      toast.success('Pontuação atualizada com sucesso');
    },
    onError: (error: any) => {
      console.error('Error updating score:', error);
      toast.error(`Erro ao atualizar pontuação: ${error.message}`);
    }
  });

  return {
    updateScoreMutation
  };
}
