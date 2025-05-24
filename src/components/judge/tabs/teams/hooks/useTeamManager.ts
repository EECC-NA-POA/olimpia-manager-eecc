import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { TeamData, ModalityOption, AthleteOption } from '../types';

export function useTeamManager(eventId: string | null, isOrganizer: boolean = false) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedModalityId, setSelectedModalityId] = useState<number | null>(null);
  
  // Get user's branch ID
  const branchId = user?.filial_id;

  // Fetch collective modalities
  const { data: modalities = [], isLoading: loadingModalities } = useQuery({
    queryKey: ['team-modalities', eventId],
    queryFn: async (): Promise<ModalityOption[]> => {
      if (!eventId) return [];

      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, categoria')
        .eq('evento_id', eventId)
        .eq('tipo_modalidade', 'coletivo')
        .order('nome');

      if (error) throw error;
      return data || [];
    },
    enabled: !!eventId,
  });

  // Fetch teams for selected modality
  const { data: teams = [], isLoading: loadingTeams } = useQuery({
    queryKey: ['teams-data', eventId, selectedModalityId, branchId, isOrganizer],
    queryFn: async () => {
      if (!eventId || !selectedModalityId) return [];

      let query = supabase
        .from('equipes')
        .select(`
          id,
          nome,
          modalidade_id,
          evento_id,
          created_by
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', selectedModalityId);

      if (!isOrganizer && branchId) {
        query = query.eq('created_by', user?.id);
      }

      const { data: teamsData, error } = await query;
      if (error) throw error;

      if (!teamsData) return [];

      // Get modality info
      const modalityInfo = modalities.find(m => m.id === selectedModalityId);

      // Process teams with athletes
      const processedTeams: TeamData[] = [];
      
      for (const team of teamsData) {
        // Get team athletes
        const { data: athletesData } = await supabase
          .from('atletas_equipes')
          .select(`
            id,
            atleta_id,
            posicao,
            raia,
            usuarios!inner(
              nome_completo,
              tipo_documento,
              numero_documento
            )
          `)
          .eq('equipe_id', team.id);

        const atletas = athletesData?.map(athlete => ({
          id: athlete.id,
          atleta_id: athlete.atleta_id,
          nome: athlete.usuarios.nome_completo,
          posicao: athlete.posicao || 0,
          raia: athlete.raia,
          documento: `${athlete.usuarios.tipo_documento}: ${athlete.usuarios.numero_documento}`
        })) || [];

        processedTeams.push({
          id: team.id,
          nome: team.nome,
          modalidade_id: team.modalidade_id,
          filial_id: branchId || '',
          evento_id: team.evento_id,
          modalidade_info: modalityInfo,
          atletas
        });
      }

      return processedTeams;
    },
    enabled: !!eventId && !!selectedModalityId,
  });

  // Fetch available athletes
  const { data: availableAthletes = [], isLoading: loadingAthletes } = useQuery({
    queryKey: ['available-athletes-simple', eventId, selectedModalityId, branchId],
    queryFn: async (): Promise<AthleteOption[]> => {
      if (!eventId || !selectedModalityId || isOrganizer || !branchId) return [];

      // Get enrolled athletes in this modality from this branch
      const { data: enrollments } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          atleta_id,
          usuarios!inner(
            nome_completo,
            tipo_documento,
            numero_documento,
            filial_id
          )
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', selectedModalityId)
        .eq('status', 'confirmado')
        .eq('usuarios.filial_id', branchId);

      if (!enrollments) return [];

      // Filter out athletes already in teams
      const athletesInTeams = new Set(teams.flatMap(team => team.atletas.map(a => a.atleta_id)));
      
      return enrollments
        .filter(enrollment => !athletesInTeams.has(enrollment.atleta_id))
        .map(enrollment => ({
          id: enrollment.atleta_id,
          nome: enrollment.usuarios.nome_completo,
          documento: `${enrollment.usuarios.tipo_documento}: ${enrollment.usuarios.numero_documento}`
        }));
    },
    enabled: !!eventId && !!selectedModalityId && !isOrganizer && !!branchId,
  });

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

  return {
    modalities,
    teams,
    availableAthletes,
    selectedModalityId,
    setSelectedModalityId,
    isLoading: loadingModalities || loadingTeams || loadingAthletes,
    createTeam: createTeamMutation.mutate,
    addAthlete: ({ teamId, athleteId }: { teamId: number; athleteId: string }) => 
      addAthleteMutation.mutate({ teamId, athleteId }),
    removeAthlete: removeAthleteMutation.mutate,
    isCreatingTeam: createTeamMutation.isPending,
    isAddingAthlete: addAthleteMutation.isPending,
    isRemovingAthlete: removeAthleteMutation.isPending
  };
}
