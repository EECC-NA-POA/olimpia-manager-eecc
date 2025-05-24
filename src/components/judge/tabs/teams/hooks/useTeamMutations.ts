
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useTeamMutations(
  eventId: string | null,
  selectedModalityId: number | null,
  isOrganizer: boolean
) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Create team mutation
  const createTeamMutation = useMutation({
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

  // Delete team mutation
  const deleteTeamMutation = useMutation({
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

  // Add athlete to team mutation
  const addAthleteMutation = useMutation({
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
          atleta_id: athleteId,
          posicao: 0
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

  // Remove athlete from team mutation  
  const removeAthleteMutation = useMutation({
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

  // Update athlete position mutation
  const updateAthletePositionMutation = useMutation({
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

  return {
    createTeam: createTeamMutation.mutate,
    deleteTeam: deleteTeamMutation.mutate,
    addAthlete: ({ teamId, athleteId }: { teamId: number; athleteId: string }) => 
      addAthleteMutation.mutate({ teamId, athleteId }),
    removeAthlete: removeAthleteMutation.mutate,
    updateAthletePosition: updateAthletePositionMutation.mutate,
    isCreatingTeam: createTeamMutation.isPending,
    isDeletingTeam: deleteTeamMutation.isPending,
    isAddingAthlete: addAthleteMutation.isPending,
    isRemovingAthlete: removeAthleteMutation.isPending,
    isUpdatingAthlete: updateAthletePositionMutation.isPending
  };
}
