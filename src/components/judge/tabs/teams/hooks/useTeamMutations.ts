
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
  const branchId = user?.filial_id;

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (teamName: string) => {
      if (!eventId || !selectedModalityId || !branchId) {
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
        queryKey: ['teams-data', eventId, selectedModalityId, branchId, isOrganizer] 
      });
      toast.success('Equipe criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar equipe: ' + error.message);
    }
  });

  // Add athlete to team mutation
  const addAthleteMutation = useMutation({
    mutationFn: async ({ teamId, athleteId }: { teamId: number; athleteId: string }) => {
      console.log('Adding athlete to team:', { teamId, athleteId });

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
      queryClient.invalidateQueries({ 
        queryKey: ['teams-data', eventId, selectedModalityId, branchId, isOrganizer] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['available-athletes-simple', eventId, selectedModalityId, branchId] 
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
      console.log('Removing athlete from team:', athleteTeamId);

      const { error } = await supabase
        .from('atletas_equipes')
        .delete()
        .eq('id', athleteTeamId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['teams-data', eventId, selectedModalityId, branchId, isOrganizer] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['available-athletes-simple', eventId, selectedModalityId, branchId] 
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
        queryKey: ['teams-data', eventId, selectedModalityId, branchId, isOrganizer] 
      });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar atleta: ' + error.message);
    }
  });

  return {
    createTeam: createTeamMutation.mutate,
    addAthlete: ({ teamId, athleteId }: { teamId: number; athleteId: string }) => 
      addAthleteMutation.mutate({ teamId, athleteId }),
    removeAthlete: removeAthleteMutation.mutate,
    updateAthletePosition: updateAthletePositionMutation.mutate,
    isCreatingTeam: createTeamMutation.isPending,
    isAddingAthlete: addAthleteMutation.isPending,
    isRemovingAthlete: removeAthleteMutation.isPending,
    isUpdatingAthlete: updateAthletePositionMutation.isPending
  };
}
