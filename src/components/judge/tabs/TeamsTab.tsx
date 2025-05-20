
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
  isOrganizer?: boolean; // Para determinar permissões diferentes
}

// Define explicit types for our queries
interface UserInfo {
  id: string;
  filial_id: string;
}

interface Modality {
  modalidade_id: number;
  modalidade_nome: string;
  categoria: string;
  tipo_modalidade: string;
}

interface TeamAthlete {
  id: number;
  posicao: number;
  raia: number | null;
  atleta_id: string;
  usuarios: {
    nome_completo: string;
    email: string;
    telefone: string;
    tipo_documento: string;
    numero_documento: string;
  };
}

interface Team {
  id: number;
  nome: string;
  athletes: TeamAthlete[];
}

interface AvailableAthlete {
  atleta_id: string;
  atleta_nome: string;
  atleta_telefone: string;
  atleta_email: string;
  tipo_documento: string;
  numero_documento: string;
  filial_id: string;
}

export function TeamsTab({ userId, eventId, isOrganizer = false }: TeamsTabProps) {
  const queryClient = useQueryClient();
  const [selectedModalityId, setSelectedModalityId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState('');

  // Fetch user branch info if not an organizer
  const { data: userInfo } = useQuery({
    queryKey: ['user-info', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, filial_id')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user info:', error);
        return null;
      }
      
      return data as UserInfo | null;
    },
    enabled: !!userId && !isOrganizer,
  });

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
        toast({
          title: "Erro",
          description: 'Não foi possível carregar as modalidades',
          variant: "destructive"
        });
        return [];
      }
      
      // Remove duplicates (since the view joins with athletes)
      const uniqueModalities = data.reduce((acc: Modality[], current: Modality) => {
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
    queryKey: ['teams', eventId, selectedModalityId, isOrganizer, userInfo?.filial_id],
    queryFn: async () => {
      if (!eventId || !selectedModalityId) return [];
      
      let query = supabase
        .from('equipes')
        .select('id, nome')
        .eq('evento_id', eventId)
        .eq('modalidade_id', selectedModalityId);
      
      // If not an organizer, filter teams by branch
      if (!isOrganizer && userInfo?.filial_id) {
        query = query.eq('filial_id', userInfo.filial_id);
      }
      
      const { data: teamsData, error: teamsError } = await query.order('nome');
      
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
          
          return { ...team, athletes: athletesData || [] } as Team;
        })
      );
      
      return teamsWithAthletes;
    },
    enabled: !!eventId && !!selectedModalityId,
  });

  // Fetch athletes available for team formation
  const { data: availableAthletes } = useQuery({
    queryKey: ['athletes', eventId, selectedModalityId, isOrganizer, userInfo?.filial_id],
    queryFn: async () => {
      if (!eventId || !selectedModalityId) return [];
      
      let query = supabase
        .from('vw_modalidades_atletas_confirmados')
        .select(`
          atleta_id,
          atleta_nome,
          atleta_telefone,
          atleta_email,
          tipo_documento,
          numero_documento,
          filial_id
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', selectedModalityId);
      
      // Se não for organizador, filtrar atletas pela filial do usuário
      if (!isOrganizer && userInfo?.filial_id) {
        query = query.eq('filial_id', userInfo.filial_id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching athletes:', error);
        return [];
      }
      
      // Filter out athletes who are already in teams
      if (existingTeams && existingTeams.length > 0) {
        const athletesInTeams = new Set<string>();
        existingTeams.forEach((team: Team) => {
          team.athletes.forEach((athlete: TeamAthlete) => {
            athletesInTeams.add(athlete.atleta_id);
          });
        });
        
        return (data as AvailableAthlete[]).filter((athlete) => 
          !athletesInTeams.has(athlete.atleta_id)
        );
      }
      
      return data as AvailableAthlete[];
    },
    enabled: !!eventId && !!selectedModalityId && !!existingTeams,
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (newTeam: { name: string }) => {
      if (!eventId || !selectedModalityId) {
        throw new Error('Missing event ID or modality ID');
      }
      
      // Determinar a filial_id com base no perfil
      const filial_id = isOrganizer ? null : userInfo?.filial_id;
      
      // Se não for organizador, precisa ter uma filial
      if (!isOrganizer && !filial_id) {
        throw new Error('Missing branch ID for delegation representative');
      }
      
      const { data, error } = await supabase
        .from('equipes')
        .insert({
          nome: newTeam.name,
          evento_id: eventId,
          modalidade_id: selectedModalityId,
          filial_id: filial_id,
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
      queryClient.invalidateQueries({ queryKey: ['teams', eventId, selectedModalityId, isOrganizer, userInfo?.filial_id] });
      setTeamName('');
      toast({
        title: "Equipe criada",
        description: 'A equipe foi criada com sucesso',
        variant: "success"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
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
      toast({
        title: "Nome obrigatório",
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
                  {modalities.map((modality: Modality) => (
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
                    isOrganizer={isOrganizer}
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
