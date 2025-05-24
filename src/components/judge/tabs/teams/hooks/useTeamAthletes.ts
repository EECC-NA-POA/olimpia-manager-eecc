
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTeamAthletes(eventId: string | null, modalityId: number | null, branchId?: string | null) {
  const queryClient = useQueryClient();

  const addAthleteToTeam = useMutation({
    mutationFn: async ({ teamId, athleteId }: { teamId: number; athleteId: string }) => {
      console.log('Adding athlete to team:', { teamId, athleteId });

      // Verificar se o atleta já está na equipe
      const { data: existingAthlete, error: checkError } = await supabase
        .from('atletas_equipes')
        .select('id')
        .eq('equipe_id', teamId)
        .eq('atleta_id', athleteId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing athlete:', checkError);
        throw new Error('Erro ao verificar atleta na equipe');
      }

      if (existingAthlete) {
        throw new Error('Atleta já está nesta equipe');
      }

      // Adicionar atleta à equipe
      const { data, error } = await supabase
        .from('atletas_equipes')
        .insert({
          equipe_id: teamId,
          atleta_id: athleteId,
          posicao: 0, // Posição padrão
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
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: ['teams', eventId, modalityId, false, branchId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['available-athletes', modalityId, eventId, branchId] 
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
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: ['teams', eventId, modalityId, false, branchId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['available-athletes', modalityId, eventId, branchId] 
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
      // Invalidar apenas as equipes para atualização em tempo real
      queryClient.invalidateQueries({ 
        queryKey: ['teams', eventId, modalityId, false, branchId] 
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
