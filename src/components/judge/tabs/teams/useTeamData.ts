
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Team, UserInfo, Modality, AvailableAthlete } from './types';

export function useTeamData(userId: string, eventId: string | null, isOrganizer = false) {
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
      
      return data as UserInfo;
    },
    enabled: !!userId && !isOrganizer,
  });

  // Fetch modalities with simplified type handling
  const { data: modalities, isLoading: isLoadingModalities } = useQuery({
    queryKey: ['modalities', eventId],
    queryFn: async () => {
      if (!eventId) return [] as Modality[];
      
      // Get modalities with confirmed athlete enrollments
      const { data, error } = await supabase
        .from('vw_modalidades_atletas_confirmados')
        .select('modalidade_id, modalidade_nome, categoria, tipo_modalidade')
        .eq('evento_id', eventId)
        .order('modalidade_nome');
      
      if (error) {
        console.error('Error fetching modalities:', error);
        toast({
          title: "Erro",
          description: 'Não foi possível carregar as modalidades',
          variant: "destructive"
        });
        return [] as Modality[];
      }
      
      // Process unique modalities
      const uniqueModalitiesMap = new Map<number, Modality>();
      
      if (data && data.length > 0) {
        data.forEach(item => {
          uniqueModalitiesMap.set(item.modalidade_id, {
            modalidade_id: item.modalidade_id,
            modalidade_nome: item.modalidade_nome,
            categoria: item.categoria,
            tipo_modalidade: item.tipo_modalidade
          });
        });
      }
      
      // Convert map to array
      return Array.from(uniqueModalitiesMap.values());
    },
    enabled: !!eventId,
  });

  // Fetch existing teams
  const { data: existingTeams, isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams', eventId, selectedModalityId, isOrganizer, userInfo?.filial_id],
    queryFn: async () => {
      if (!eventId || !selectedModalityId) return [] as Team[];
      
      // Build the teams query
      let query = supabase
        .from('equipes')
        .select('id, nome')
        .eq('evento_id', eventId)
        .eq('modalidade_id', selectedModalityId);
      
      // Filter by branch if not an organizer
      if (!isOrganizer && userInfo?.filial_id) {
        query = query.eq('filial_id', userInfo.filial_id);
      }
      
      const { data: teamsData, error: teamsError } = await query.order('nome');
      
      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        return [] as Team[];
      }
      
      // Process teams with explicit typing
      const teams: Team[] = [];
      
      for (const team of teamsData || []) {
        const teamObj: Team = {
          id: team.id,
          nome: team.nome,
          athletes: []
        };
        
        // Fetch athletes for this team
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
        } else if (athletesData && athletesData.length > 0) {
          teamObj.athletes = athletesData.map(item => ({
            id: item.id,
            posicao: item.posicao,
            raia: item.raia,
            atleta_id: item.atleta_id,
            usuarios: {
              nome_completo: item.usuarios.nome_completo,
              email: item.usuarios.email,
              telefone: item.usuarios.telefone,
              tipo_documento: item.usuarios.tipo_documento,
              numero_documento: item.usuarios.numero_documento
            }
          }));
        }
        
        teams.push(teamObj);
      }
      
      return teams;
    },
    enabled: !!eventId && !!selectedModalityId,
  });

  // Fetch available athletes
  const { data: availableAthletes } = useQuery({
    queryKey: ['athletes', eventId, selectedModalityId, isOrganizer, userInfo?.filial_id, existingTeams],
    queryFn: async () => {
      if (!eventId || !selectedModalityId) return [] as AvailableAthlete[];
      
      // Construct a safe query for confirmed athletes
      const { data, error } = await supabase
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
      
      if (error) {
        console.error('Error fetching athletes:', error);
        // Return an empty array if there's an error
        return [] as AvailableAthlete[];
      }
      
      // Ensure we have data before proceeding
      if (!data || !Array.isArray(data)) {
        return [] as AvailableAthlete[];
      }
      
      // Filter by branch if not an organizer
      let filteredAthletes = data;
      if (!isOrganizer && userInfo?.filial_id) {
        filteredAthletes = data.filter(athlete => athlete.filial_id === userInfo.filial_id);
      }
      
      // Create a Set of athlete IDs already in teams
      const athletesInTeams = new Set<string>();
      
      if (existingTeams && existingTeams.length > 0) {
        existingTeams.forEach(team => {
          team.athletes.forEach(athlete => {
            athletesInTeams.add(athlete.atleta_id);
          });
        });
      }
      
      // Filter and map athletes safely
      const availableAthletesArray: AvailableAthlete[] = filteredAthletes
        .filter(athlete => !athletesInTeams.has(athlete.atleta_id))
        .map(athlete => ({
          atleta_id: athlete.atleta_id,
          atleta_nome: athlete.atleta_nome,
          atleta_telefone: athlete.atleta_telefone,
          atleta_email: athlete.atleta_email,
          tipo_documento: athlete.tipo_documento,
          numero_documento: athlete.numero_documento,
          filial_id: athlete.filial_id
        }));
      
      return availableAthletesArray;
    },
    enabled: !!eventId && !!selectedModalityId && !!existingTeams,
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (newTeam: { name: string }) => {
      if (!eventId || !selectedModalityId) {
        throw new Error('Missing event ID or modality ID');
      }
      
      // Determine branch ID based on profile
      const filial_id = isOrganizer ? null : userInfo?.filial_id;
      
      // Branch ID is required for non-organizers
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
      queryClient.invalidateQueries({ 
        queryKey: ['teams', eventId, selectedModalityId, isOrganizer, userInfo?.filial_id] 
      });
      setTeamName('');
      toast({
        title: "Equipe criada",
        description: 'A equipe foi criada com sucesso',
        variant: "default"
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

  return {
    userInfo,
    modalities,
    isLoadingModalities,
    selectedModalityId,
    setSelectedModalityId,
    existingTeams,
    isLoadingTeams,
    availableAthletes: availableAthletes || [],
    teamName,
    setTeamName,
    createTeamMutation,
    handleCreateTeam
  };
}
