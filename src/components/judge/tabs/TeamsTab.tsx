
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { TeamFormation } from '@/components/judge/TeamFormation';
import { toast } from '@/hooks/use-toast';

interface TeamsTabProps {
  userId: string;
  eventId: string | null;
}

interface Team {
  id: number;
  name: string;
  athletes: any[];
}

interface Athlete {
  atleta_id: string;
  atleta_nome: string;
  atleta_telefone?: string;
  atleta_email?: string;
  tipo_documento: string;
  numero_documento: string;
}

export function TeamsTab({ userId, eventId }: TeamsTabProps) {
  const queryClient = useQueryClient();
  const [selectedModalityId, setSelectedModalityId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);

  // Fetch modalities
  const { data: modalities, isLoading: isLoadingModalities } = useQuery({
    queryKey: ['modalities', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      // Get modalities with confirmed athlete enrollments
      const { data, error } = await supabase
        .from('vw_modalidades_atletas_confirmados')
        .select('modalidade_id, modalidade_nome, categoria, tipo_modalidade')
        .eq('evento_id', eventId)
        .order('modalidade_nome')
        .limit(100);
      
      if (error) {
        console.error('Error fetching modalities:', error);
        toast("Erro", {
          description: 'Não foi possível carregar as modalidades',
          variant: "destructive"
        });
        return [];
      }
      
      // Remove duplicates (since the view joins with athletes)
      const uniqueModalities = data.reduce((acc: any[], current: any) => {
        const x = acc.find(item => item.modalidade_id === current.modalidade_id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
      
      return uniqueModalities;
    },
    enabled: !!eventId,
  });

  // Fetch existing teams for the selected modality
  const { data: existingTeams, isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams', eventId, selectedModalityId],
    queryFn: async () => {
      if (!eventId || !selectedModalityId) return [];
      
      const { data: teamsData, error: teamsError } = await supabase
        .from('equipes')
        .select('id, nome')
        .eq('evento_id', eventId)
        .eq('modalidade_id', selectedModalityId)
        .order('nome');
      
      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        return [];
      }
      
      // For each team, fetch its athletes
      const teamsWithAthletes = await Promise.all(
        teamsData.map(async (team) => {
          const { data: athletesData, error: athletesError } = await supabase
            .from('atletas_equipes')
            .select(`
              id,
              posicao,
              raia,
              atleta_id,
              usuarios!inner(nome_completo, email, telefone, tipo_documento, numero_documento)
            `)
            .eq('equipe_id', team.id)
            .order('posicao');
          
          if (athletesError) {
            console.error(`Error fetching athletes for team ${team.id}:`, athletesError);
            return { ...team, athletes: [] };
          }
          
          return { ...team, athletes: athletesData || [] };
        })
      );
      
      return teamsWithAthletes;
    },
    enabled: !!eventId && !!selectedModalityId,
  });

  // Fetch athletes available for team formation
  const { data: availableAthletes } = useQuery({
    queryKey: ['athletes', eventId, selectedModalityId],
    queryFn: async () => {
      if (!eventId || !selectedModalityId) return [];
      
      const { data, error } = await supabase
        .from('vw_modalidades_atletas_confirmados')
        .select(`
          atleta_id,
          atleta_nome,
          atleta_telefone,
          atleta_email,
          tipo_documento,
          numero_documento
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', selectedModalityId);
      
      if (error) {
        console.error('Error fetching athletes:', error);
        return [];
      }
      
      // Filter out athletes who are already in teams
      if (existingTeams && existingTeams.length > 0) {
        const athletesInTeams = new Set();
        existingTeams.forEach((team: any) => {
          team.athletes.forEach((athlete: any) => {
            athletesInTeams.add(athlete.atleta_id);
          });
        });
        
        return data.filter((athlete: Athlete) => !athletesInTeams.has(athlete.atleta_id));
      }
      
      return data;
    },
    enabled: !!eventId && !!selectedModalityId && !!existingTeams,
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (newTeam: { name: string }) => {
      if (!eventId || !selectedModalityId) {
        throw new Error('Missing event ID or modality ID');
      }
      
      const { data, error } = await supabase
        .from('equipes')
        .insert({
          nome: newTeam.name,
          evento_id: eventId,
          modalidade_id: selectedModalityId,
          created_by: userId
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Error creating team:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', eventId, selectedModalityId] });
      setTeamName('');
      toast("Equipe criada", {
        description: 'A equipe foi criada com sucesso'
      });
    },
    onError: (error) => {
      toast("Erro", {
        description: 'Não foi possível criar a equipe',
        variant: "destructive"
      });
    }
  });

  // Handle modality selection
  const handleModalityChange = (value: string) => {
    setSelectedModalityId(Number(value));
  };

  // Handle team creation
  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      toast("Nome obrigatório", {
        description: 'Por favor, informe um nome para a equipe',
        variant: "destructive"
      });
      return;
    }
    
    createTeamMutation.mutate({ name: teamName });
  };

  if (isLoadingModalities) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!modalities || modalities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhuma modalidade disponível</CardTitle>
          <CardDescription>
            Não existem modalidades com atletas confirmados para este evento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Formação de Equipes</CardTitle>
          <CardDescription>
            Selecione uma modalidade para gerenciar equipes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium">Modalidade</label>
              <Select onValueChange={handleModalityChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma modalidade" />
                </SelectTrigger>
                <SelectContent>
                  {modalities.map((modality: any) => (
                    <SelectItem 
                      key={modality.modalidade_id} 
                      value={modality.modalidade_id.toString()}
                    >
                      {modality.modalidade_nome} - {modality.categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedModalityId && (
              <>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Nova Equipe</label>
                    <Input 
                      placeholder="Nome da equipe" 
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleCreateTeam}
                    disabled={createTeamMutation.isPending}
                  >
                    {createTeamMutation.isPending ? 'Criando...' : 'Criar Equipe'}
                  </Button>
                </div>
                
                {isLoadingTeams ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <TeamFormation 
                    teams={existingTeams || []}
                    availableAthletes={availableAthletes || []}
                    eventId={eventId}
                    modalityId={selectedModalityId}
                  />
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
