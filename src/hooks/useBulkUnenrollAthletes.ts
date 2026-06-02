import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface BulkUnenrollParams {
  athleteIds: string[];
  modalityId: number;
  eventId: string;
}

export function useBulkUnenrollAthletes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ athleteIds, modalityId, eventId }: BulkUnenrollParams) => {
      const { error } = await supabase
        .from('inscricoes_modalidades')
        .delete()
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .in('atleta_id', athleteIds);

      if (error) throw error;
    },
    onSuccess: (_, { athleteIds }) => {
      queryClient.invalidateQueries({ queryKey: ['enrolled-in-modality'] });
      queryClient.invalidateQueries({ queryKey: ['athlete-modalities'] });
      queryClient.invalidateQueries({ queryKey: ['athlete-management'] });
      queryClient.invalidateQueries({ queryKey: ['available-modalities-athlete'] });
      queryClient.invalidateQueries({ queryKey: ['branch-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['confirmed-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['pending-enrollments'] });
      toast.success(`${athleteIds.length} atleta(s) desinscrito(s) com sucesso!`);
    },
    onError: () => {
      toast.error('Erro ao desinscrever atletas.');
    },
  });
}
