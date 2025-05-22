
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface TeamFormData {
  nome: string;
  modalidade_id: string;
  cor_uniforme?: string;
  observacoes?: string;
}

export function useTeamOperations(eventId: string | null, branchId?: string) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<null | any>(null);

  // Query to fetch team modalities (collective ones)
  const { 
    data: teamModalities, 
    isLoading: isLoadingModalities, 
    error: modalitiesError 
  } = useQuery({
    queryKey: ['team-modalities', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, categoria, tipo_modalidade')
        .eq('evento_id', eventId)
        .eq('tipo_modalidade', 'coletivo');
      
      if (error) {
        console.error('Error fetching team modalities:', error);
        throw new Error('Não foi possível carregar as modalidades coletivas');
      }
      
      return data;
    },
    enabled: !!eventId,
  });

  // Query to fetch teams
  const { 
    data: teams, 
    isLoading: isLoadingTeams, 
    error: teamsError 
  } = useQuery({
    queryKey: ['teams', eventId, branchId],
    queryFn: async () => {
      if (!eventId || !branchId) return [];
      
      const { data, error } = await supabase
        .from('equipes')
        .select(`
          id,
          nome,
          cor_uniforme,
          observacoes,
          modalidade_id,
          modalidades (
            nome,
            categoria
          )
        `)
        .eq('evento_id', eventId)
        .eq('filial_id', branchId);
      
      if (error) {
        console.error('Error fetching teams:', error);
        throw new Error('Não foi possível carregar as equipes');
      }
      
      // Map the teams to match the expected Team type
      return data?.map(team => ({
        id: team.id,
        nome: team.nome,
        cor_uniforme: team.cor_uniforme,
        observacoes: team.observacoes,
        modalidade_id: team.modalidade_id,
        // Ensure modalidades is treated as a single object, not an array
        modalidades: {
          nome: team.modalidades?.nome,
          categoria: team.modalidades?.categoria
        }
      }));
    },
    enabled: !!eventId && !!branchId,
  });

  // Mutation to create/update team
  const teamMutation = useMutation({
    mutationFn: async (teamData: TeamFormData) => {
      const formattedData = {
        ...teamData,
        modalidade_id: parseInt(teamData.modalidade_id),
      };
      
      if (editingTeam) {
        // Update existing team
        const { data, error } = await supabase
          .from('equipes')
          .update(formattedData)
          .eq('id', editingTeam.id)
          .select();
        
        if (error) throw error;
        return data;
      } else {
        // Create new team
        const { data, error } = await supabase
          .from('equipes')
          .insert([{ ...formattedData, evento_id: eventId, filial_id: branchId }])
          .select();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', eventId, branchId] });
      toast.success(editingTeam ? 'Equipe atualizada com sucesso!' : 'Equipe criada com sucesso!');
      resetAndCloseDialog();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message || 'Não foi possível salvar a equipe'}`);
    }
  });

  // Mutation to delete a team
  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: number) => {
      const { error } = await supabase
        .from('equipes')
        .delete()
        .eq('id', teamId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', eventId, branchId] });
      toast.success('Equipe excluída com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir equipe: ${error.message}`);
    }
  });

  // Handle form submission
  const handleSubmit = (data: TeamFormData) => {
    teamMutation.mutate(data);
  };

  // Reset form and close dialog
  const resetAndCloseDialog = () => {
    setEditingTeam(null);
    setIsDialogOpen(false);
  };

  // Handle edit team
  const handleEditTeam = (team: any) => {
    setEditingTeam(team);
    setIsDialogOpen(true);
  };

  // Handle delete team
  const handleDeleteTeam = (teamId: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta equipe?')) {
      deleteTeamMutation.mutate(teamId);
    }
  };

  // Handle new team dialog
  const handleNewTeamClick = () => {
    setEditingTeam(null);
    setIsDialogOpen(true);
  };

  return {
    teamModalities,
    teams,
    isLoadingModalities,
    isLoadingTeams,
    modalitiesError,
    teamsError,
    isDialogOpen,
    setIsDialogOpen,
    editingTeam,
    teamMutation,
    handleSubmit,
    resetAndCloseDialog,
    handleEditTeam,
    handleDeleteTeam,
    handleNewTeamClick
  };
}
