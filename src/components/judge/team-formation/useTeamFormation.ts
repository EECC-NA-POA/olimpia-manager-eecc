
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Team } from '../tabs/teams/types';

interface UseTeamFormationProps {
  teams: Team[];
  eventId: string | null;
  modalityId: number;
  isOrganizer?: boolean;
}

export function useTeamFormation({ 
  teams, 
  eventId, 
  modalityId,
  isOrganizer = false
}: UseTeamFormationProps) {
  const queryClient = useQueryClient();
  const [isAddingAthlete, setIsAddingAthlete] = useState(false);

  const addAthleteMutation = useMutation({
    mutationFn: async ({ teamId, athleteId }: { teamId: number, athleteId: string }) => {
      // Get the team to find the next position
      const team = teams.find(t => t.id === teamId);
      if (!team) throw new Error('Team not found');
      
      // Calculate next position
      const nextPosition = team.athletes.length > 0 
        ? Math.max(...team.athletes.map(a => a.posicao)) + 1 
        : 1;
      
      // Insert athlete into team
      const { data, error } = await supabase
        .from('atletas_equipes')
        .insert({
          equipe_id: teamId,
          atleta_id: athleteId,
          posicao: nextPosition,
        })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', eventId, modalityId] });
      queryClient.invalidateQueries({ queryKey: ['athletes', eventId, modalityId] });
      toast.success('Atleta adicionado à equipe');
    },
    onError: (error) => {
      console.error('Error adding athlete:', error);
      toast.error('Erro ao adicionar atleta à equipe');
    },
  });

  const removeAthleteMutation = useMutation({
    mutationFn: async ({ teamId, athleteId }: { teamId: number, athleteId: string }) => {
      // Find the athlete in the team to get its ID
      const team = teams.find(t => t.id === teamId);
      if (!team) throw new Error('Team not found');
      
      const athlete = team.athletes.find(a => a.atleta_id === athleteId);
      if (!athlete) throw new Error('Athlete not found in team');
      
      // Delete the athlete from the team
      const { error } = await supabase
        .from('atletas_equipes')
        .delete()
        .eq('id', athlete.id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', eventId, modalityId] });
      queryClient.invalidateQueries({ queryKey: ['athletes', eventId, modalityId] });
      toast.success('Atleta removido da equipe');
    },
    onError: (error) => {
      console.error('Error removing athlete:', error);
      toast.error('Erro ao remover atleta da equipe');
    },
  });

  const updateLaneMutation = useMutation({
    mutationFn: async ({ 
      teamId, 
      athleteId, 
      lane,
      position
    }: { 
      teamId: number, 
      athleteId: string, 
      lane: number,
      position: number 
    }) => {
      // Find the athlete in the team to get its ID
      const team = teams.find(t => t.id === teamId);
      if (!team) throw new Error('Team not found');
      
      const athlete = team.athletes.find(a => a.atleta_id === athleteId);
      if (!athlete) throw new Error('Athlete not found in team');
      
      // Update the lane for the athlete
      const { error } = await supabase
        .from('atletas_equipes')
        .update({ raia: lane, posicao: position })
        .eq('id', athlete.id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', eventId, modalityId] });
      toast.success('Raia atualizada com sucesso');
    },
    onError: (error) => {
      console.error('Error updating lane:', error);
      toast.error('Erro ao atualizar raia');
    },
  });

  const handleAddAthleteToTeam = async (teamId: number, athleteId: string) => {
    setIsAddingAthlete(true);
    try {
      await addAthleteMutation.mutateAsync({ teamId, athleteId });
    } finally {
      setIsAddingAthlete(false);
    }
  };

  const handleRemoveAthleteFromTeam = (teamId: number, athleteId: string) => {
    removeAthleteMutation.mutate({ teamId, athleteId });
  };

  const handleUpdateLane = (teamId: number, athleteId: string, lane: number, position: number) => {
    updateLaneMutation.mutate({ teamId, athleteId, lane, position });
  };

  return {
    handleAddAthleteToTeam,
    handleRemoveAthleteFromTeam,
    handleUpdateLane,
    isUpdatePending: updateLaneMutation.isPending,
    isRemovePending: removeAthleteMutation.isPending,
    isAddingAthlete
  };
}
