
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTeamAthletes(eventId: string | null, modalityId: number | null, branchId?: string | null) {
  const queryClient = useQueryClient();

  const addAthleteToTeam = useMutation({
    mutationFn: async ({ teamId, athleteId }: { teamId: number; athleteId: string }) => {
      console.log('Adding athlete to team:', { teamId, athleteId });

      // Check if athlete is already in this specific team
      const { data: existingInSameTeam, error: checkSameTeamError } = await supabase
        .from('atletas_equipes')
        .select('id')
        .eq('equipe_id', teamId)
        .eq('atleta_id', athleteId)
        .single();

      if (checkSameTeamError && checkSameTeamError.code !== 'PGRST116') {
        console.error('Error checking athlete in same team:', checkSameTeamError);
        throw new Error('Erro ao verificar atleta na equipe');
      }

      if (existingInSameTeam) {
        throw new Error('Atleta já está nesta equipe');
      }

      // For organizers: Remove athlete from any existing team in this modality and event
      // For regular users: Only allow if athlete is from same branch
      const { data: existingTeamMembership, error: checkError } = await supabase
        .from('atletas_equipes')
        .select(`
          id,
          equipes!inner(modalidade_id, evento_id, filial_id)
        `)
        .eq('atleta_id', athleteId);

      if (checkError) {
        console.error('Error checking existing athlete membership:', checkError);
        throw new Error('Erro ao verificar atleta em equipes');
      }

      // Remove from teams in the same modality and event
      if (existingTeamMembership && existingTeamMembership.length > 0) {
        const membershipsToRemove = existingTeamMembership.filter(membership => {
          const equipe = Array.isArray(membership.equipes) ? membership.equipes[0] : membership.equipes;
          return equipe && equipe.modalidade_id === modalityId && equipe.evento_id === eventId;
        });

        if (membershipsToRemove.length > 0) {
          const { error: removeError } = await supabase
            .from('atletas_equipes')
            .delete()
            .in('id', membershipsToRemove.map(m => m.id));

          if (removeError) {
            console.error('Error removing athlete from previous teams:', removeError);
            throw new Error('Erro ao remover atleta de equipe anterior');
          }
        }
      }

      // Add athlete to new team
      const { data, error } = await supabase
        .from('atletas_equipes')
        .insert({
          equipe_id: teamId,
          atleta_id: athleteId,
          posicao: 0, // Default position
          raia: null
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error adding athlete to team:', error);
        throw new Error('Erro ao adicionar atleta à equipe');
      }

      console.log('Athlete added to team successfully:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['teams', eventId, modalityId, false, branchId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['available-athletes', modalityId, eventId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['all-teams', eventId] 
      });
      
      toast.success('Atleta adicionado', {
        description: 'O atleta foi adicionado à equipe com sucesso'
      });
    },
    onError: (error) => {
      console.error('Error adding athlete to team:', error);
      toast.error('Erro', {
        description: error.message || 'Não foi possível adicionar o atleta à equipe'
      });
    }
  });

  const removeAthleteFromTeam = useMutation({
    mutationFn: async (athleteTeamId: number) => {
      console.log('Removing athlete from team:', athleteTeamId);

      const { error } = await supabase
        .from('atletas_equipes')
        .delete()
        .eq('id', athleteTeamId);

      if (error) {
        console.error('Error removing athlete from team:', error);
        throw new Error('Erro ao remover atleta da equipe');
      }

      console.log('Athlete removed from team successfully');
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['teams', eventId, modalityId, false, branchId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['available-athletes', modalityId, eventId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['all-teams', eventId] 
      });
      
      toast.success('Atleta removido', {
        description: 'O atleta foi removido da equipe com sucesso'
      });
    },
    onError: (error) => {
      console.error('Error removing athlete from team:', error);
      toast.error('Erro', {
        description: error.message || 'Não foi possível remover o atleta da equipe'
      });
    }
  });

  const updateAthleteLane = useMutation({
    mutationFn: async ({ athleteTeamId, lane }: { athleteTeamId: number; lane: number | null }) => {
      console.log('Updating athlete lane:', { athleteTeamId, lane });

      const { error } = await supabase
        .from('atletas_equipes')
        .update({ raia: lane })
        .eq('id', athleteTeamId);

      if (error) {
        console.error('Error updating athlete lane:', error);
        throw new Error('Erro ao atualizar raia do atleta');
      }

      console.log('Athlete lane updated successfully');
    },
    onSuccess: () => {
      // Invalidate team queries for real-time updates
      queryClient.invalidateQueries({ 
        queryKey: ['teams', eventId, modalityId, false, branchId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['all-teams', eventId] 
      });
    },
    onError: (error) => {
      console.error('Error updating athlete lane:', error);
      toast.error('Erro', {
        description: error.message || 'Não foi possível atualizar a raia do atleta'
      });
    }
  });

  return {
    addAthleteToTeam,
    removeAthleteFromTeam,
    updateAthleteLane
  };
}
