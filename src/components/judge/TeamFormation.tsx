
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
      toast("Equipe atualizada", {
        description: 'A composição da equipe foi atualizada com sucesso'
      });
    },
    onError: (error: any) => {
      toast("Erro", {
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
      toast("Atleta removido", {
        description: 'O atleta foi removido da equipe com sucesso'
      });
    },
    onError: (error: any) => {
      toast("Erro", {
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
        <Card key={team.id}>
          <CardHeader>
            <CardTitle className="text-lg">{team.nome}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {team.athletes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Posição</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Raia</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.athletes.map((athlete: any) => (
                      <TableRow key={athlete.id}>
                        <TableCell>{athlete.posicao}</TableCell>
                        <TableCell>{athlete.usuarios.nome_completo}</TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            min="1"
                            value={athlete.raia || ''}
                            onChange={(e) => 
                              handleUpdateLane(
                                team.id, 
                                athlete.atleta_id, 
                                Number(e.target.value), 
                                athlete.posicao
                              )
                            }
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveAthleteFromTeam(team.id, athlete.atleta_id)}
                            disabled={removeAthleteFromTeamMutation.isPending}
                          >
                            Remover
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Nenhum atleta nesta equipe</p>
                </div>
              )}
              
              {availableAthletes.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Adicionar Atleta</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {availableAthletes.map((athlete) => (
                      <div
                        key={athlete.atleta_id}
                        className="border rounded-md p-2 flex justify-between items-center"
                      >
                        <span className="truncate">{athlete.atleta_nome}</span>
                        <Button
                          size="sm"
                          onClick={() => handleAddAthleteToTeam(team.id, athlete.atleta_id)}
                          disabled={updateTeamAthleteMutation.isPending}
                        >
                          Adicionar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
