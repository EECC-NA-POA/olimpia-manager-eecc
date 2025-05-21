
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
        .order('modalidade_nome')
        .limit(100);
      
      if (error) {
        console.error('Error fetching modalities:', error);
        toast({
          title: "Erro",
          description: 'Não foi possível carregar as modalidades',
          variant: "destructive"
        });
        return [] as Modality[];
      }
      
      // Handle unique modalities with direct type assertion
      const uniqueModalitiesMap = new Map<number, Modality>();
      
      if (data) {
        // Build a map of unique modalities
        for (const item of data) {
          uniqueModalitiesMap.set(item.modalidade_id, {
            modalidade_id: item.modalidade_id,
            modalidade_nome: item.modalidade_nome,
            categoria: item.categoria,
            tipo_modalidade: item.tipo_modalidade
          });
        }
      }
      
      // Convert map to array
      return Array.from(uniqueModalitiesMap.values());
    },
    enabled: !!eventId,
  });

  // Fetch existing teams with simplified type handling
  const { data: existingTeams, isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams', eventId, selectedModalityId, isOrganizer, userInfo?.filial_id],
    queryFn: async () => {
      if (!eventId || !selectedModalityId) return [] as Team[];
      
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
        return [] as Team[];
      }
      
      // Simple array to store results
      const result: Team[] = [];
      
      // Process each team individually with explicit typing
      const teamsList = teamsData || [];
      for (const team of teamsList) {
        try {
          // Type the team object explicitly
          const teamObj: Team = {
            id: team.id,
            nome: team.nome,
            athletes: []
          };
          
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
          } else if (athletesData) {
            // Transform the data with explicit typing
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
          
          result.push(teamObj);
        } catch (err) {
          console.error(`Error processing team ${team.id}:`, err);
          result.push({ id: team.id, nome: team.nome, athletes: [] });
        }
      }
      
      return result;
    },
    enabled: !!eventId && !!selectedModalityId,
  });

  // Fetch available athletes with simplified type handling
  const { data: availableAthletes } = useQuery({
    queryKey: ['athletes', eventId, selectedModalityId, isOrganizer, userInfo?.filial_id],
    queryFn: async () => {
      if (!eventId || !selectedModalityId) return [] as AvailableAthlete[];
      
      // Get confirmed athletes for the selected modality
      let query = supabase
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
      
      // If not an organizer, filter athletes by branch using the user's branch
      if (!isOrganizer && userInfo?.filial_id) {
        query = query.eq('filial_id', userInfo.filial_id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching athletes:', error);
        return [] as AvailableAthlete[];
      }
      
      // Cast to simple array to avoid deep type inference
      const allAthletes = data || [];
      
      // Filter out athletes who are already in teams
      if (existingTeams && existingTeams.length > 0) {
        // Create a simple Set of athlete IDs already in teams
        const athletesInTeamsSet = new Set<string>();
        
        // Add all athletes from teams to the set
        existingTeams.forEach(team => {
          team.athletes.forEach(athlete => {
            athletesInTeamsSet.add(athlete.atleta_id);
          });
        });
        
        // Simple filter operation with explicit return type
        return allAthletes
          .filter(athlete => !athletesInTeamsSet.has(athlete.atleta_id))
          .map(athlete => ({
            atleta_id: athlete.atleta_id,
            atleta_nome: athlete.atleta_nome,
            atleta_telefone: athlete.atleta_telefone,
            atleta_email: athlete.atleta_email,
            tipo_documento: athlete.tipo_documento,
            numero_documento: athlete.numero_documento
          }));
      }
      
      // Map to explicit structure to avoid type inference issues
      return allAthletes.map(athlete => ({
        atleta_id: athlete.atleta_id,
        atleta_nome: athlete.atleta_nome,
        atleta_telefone: athlete.atleta_telefone,
        atleta_email: athlete.atleta_email,
        tipo_documento: athlete.tipo_documento,
        numero_documento: athlete.numero_documento
      }));
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
    availableAthletes,
    teamName,
    setTeamName,
    createTeamMutation,
    handleCreateTeam
  };
}
