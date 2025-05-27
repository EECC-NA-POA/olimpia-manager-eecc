
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAddAthleteMutation(
  eventId: string | null,
  selectedModalityId: number | null,
  isOrganizer: boolean
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, athleteId }: { teamId: number; athleteId: string }) => {
      console.log('Adding athlete to team:', { teamId, athleteId, isOrganizer });

      // Check if athlete is already in the team
      const { data: existingAthlete, error: checkError } = await supabase
        .from('atletas_equipes')
        .select('id')
        .eq('equipe_id', teamId)
        .eq('atleta_id', athleteId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingAthlete) {
        throw new Error('Atleta já está nesta equipe');
      }

      // For organizers: Remove athlete from any existing team in this modality and event
      if (isOrganizer) {
        const { data: existingTeamMembership, error: checkExistingError } = await supabase
          .from('atletas_equipes')
          .select(`
            id,
            equipes!inner(modalidade_id, evento_id)
          `)
          .eq('atleta_id', athleteId);

        if (!checkExistingError && existingTeamMembership && existingTeamMembership.length > 0) {
          const membershipsToRemove = existingTeamMembership.filter(membership => {
            const equipe = Array.isArray(membership.equipes) ? membership.equipes[0] : membership.equipes;
            return equipe && equipe.modalidade_id === selectedModalityId && equipe.evento_id === eventId;
          });

          if (membershipsToRemove.length > 0) {
            const { error: removeError } = await supabase
              .from('atletas_equipes')
              .delete()
              .in('id', membershipsToRemove.map(m => m.id));

            if (removeError) {
              console.error('Error removing athlete from previous teams:', removeError);
            }
          }
        }
      }

      const { error } = await supabase
        .from('atletas_equipes')
        .insert({
          equipe_id: teamId,
          atleta_id: athleteId
        });

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
      toast.success('Atleta adicionado à equipe!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar atleta: ' + error.message);
    }
  });
}
