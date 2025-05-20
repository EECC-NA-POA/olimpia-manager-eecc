
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TeamCard } from './team-formation/TeamCard';

interface TeamFormationProps {
  teams: any[];
  availableAthletes: any[];
  eventId: string | null;
  modalityId: number;
}

export function TeamFormation({ 
  teams, 
  availableAthletes, 
  eventId, 
  modalityId 
}: TeamFormationProps) {
  const queryClient = useQueryClient();
  
  // Update team athlete mutation
  const updateTeamAthleteMutation = useMutation({
    mutationFn: async ({ 
      teamId, 
      athleteId, 
      position, 
      lane 
    }: { 
      teamId: number; 
      athleteId: string; 
      position: number; 
      lane?: number; 
    }) => {
      // Check if athlete is already in a team
      const { data: existingAssignment, error: checkError } = await supabase
        .from('atletas_equipes')
        .select('id, equipe_id')
        .eq('atleta_id', athleteId)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking athlete assignment:', checkError);
        throw checkError;
      }
      
      if (existingAssignment) {
        // If the athlete is already in this team, update position/lane
        if (existingAssignment.equipe_id === teamId) {
          const { error: updateError } = await supabase
            .from('atletas_equipes')
            .update({ 
              posicao: position,
              raia: lane || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingAssignment.id);
          
          if (updateError) {
            console.error('Error updating athlete assignment:', updateError);
            throw updateError;
          }
        } else {
          // If athlete is in another team, throw error
          throw new Error('Atleta já está em outra equipe');
        }
      } else {
        // Insert new assignment
        const { error: insertError } = await supabase
          .from('atletas_equipes')
          .insert({
            equipe_id: teamId,
            atleta_id: athleteId,
            posicao: position,
            raia: lane || null
          });
        
        if (insertError) {
          console.error('Error inserting athlete assignment:', insertError);
          throw insertError;
        }
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', eventId, modalityId] });
      queryClient.invalidateQueries({ queryKey: ['athletes', eventId, modalityId] });
      toast({
        title: "Equipe atualizada",
        description: 'A composição da equipe foi atualizada com sucesso',
        variant: "success"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || 'Não foi possível atualizar a equipe',
        variant: "destructive"
      });
    }
  });

  // Remove athlete from team mutation
  const removeAthleteFromTeamMutation = useMutation({
    mutationFn: async ({ 
      teamId, 
      athleteId 
    }: { 
      teamId: number; 
      athleteId: string; 
    }) => {
      const { error } = await supabase
        .from('atletas_equipes')
        .delete()
        .eq('equipe_id', teamId)
        .eq('atleta_id', athleteId);
      
      if (error) {
        console.error('Error removing athlete from team:', error);
        throw error;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', eventId, modalityId] });
      queryClient.invalidateQueries({ queryKey: ['athletes', eventId, modalityId] });
      toast({
        title: "Atleta removido",
        description: 'O atleta foi removido da equipe com sucesso',
        variant: "success"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || 'Não foi possível remover o atleta da equipe',
        variant: "destructive"
      });
    }
  });

  // Handle add athlete to team
  const handleAddAthleteToTeam = (teamId: number, athleteId: string) => {
    const position = teams.find(t => t.id === teamId)?.athletes.length + 1 || 1;
    updateTeamAthleteMutation.mutate({ teamId, athleteId, position });
  };

  // Handle remove athlete from team
  const handleRemoveAthleteFromTeam = (teamId: number, athleteId: string) => {
    removeAthleteFromTeamMutation.mutate({ teamId, athleteId });
  };

  // Handle lane update
  const handleUpdateLane = (teamId: number, athleteId: string, lane: number, position: number) => {
    updateTeamAthleteMutation.mutate({ teamId, athleteId, position, lane });
  };

  if (teams.length === 0 && availableAthletes.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">
          Nenhuma equipe ou atleta disponível para esta modalidade
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          availableAthletes={availableAthletes}
          onAddAthlete={handleAddAthleteToTeam}
          onRemoveAthlete={handleRemoveAthleteFromTeam}
          onUpdateLane={handleUpdateLane}
          isUpdatePending={updateTeamAthleteMutation.isPending}
          isRemovePending={removeAthleteFromTeamMutation.isPending}
        />
      ))}
    </div>
  );
}
