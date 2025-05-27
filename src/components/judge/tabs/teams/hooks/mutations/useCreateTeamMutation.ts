
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useCreateTeamMutation(
  eventId: string | null,
  selectedModalityId: number | null
) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teamName: string) => {
      if (!eventId || !selectedModalityId) {
        throw new Error('Dados necessários não encontrados');
      }

      const { data, error } = await supabase
        .from('equipes')
        .insert({
          nome: teamName,
          evento_id: eventId,
          modalidade_id: selectedModalityId,
          created_by: user?.id
        })
        .select('id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['teams-data', eventId, selectedModalityId] 
      });
      toast.success('Equipe criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar equipe: ' + error.message);
    }
  });
}
