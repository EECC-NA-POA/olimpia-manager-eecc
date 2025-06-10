
import { useState } from 'react';
import { useTeamModalities } from './useTeamModalities';
import { useTeamsData } from './useTeamsData';
import { useTeamMutations } from './useTeamMutations';

export interface TeamFormData {
  nome: string;
  modalidade_id: string;
  cor_uniforme?: string;
  observacoes?: string;
}

export function useTeamOperations(eventId: string | null, branchId?: string) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<null | any>(null);

  // Use the new smaller hooks
  const { 
    data: teamModalities, 
    isLoading: isLoadingModalities, 
    error: modalitiesError 
  } = useTeamModalities(eventId);

  const { 
    data: teams, 
    isLoading: isLoadingTeams, 
    error: teamsError 
  } = useTeamsData(eventId, branchId);

  const {
    teamMutation,
    deleteTeamMutation
  } = useTeamMutations(eventId, branchId, editingTeam);

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
