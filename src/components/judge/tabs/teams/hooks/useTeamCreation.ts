
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useTeamCreation(
  userId: string,
  eventId: string | null,
  selectedModalityId: number | null,
  userInfo: { filial_id?: string | null } | null = null,
  isOrganizer = false,
  teamName = '',
  setTeamName: (name: string) => void = () => {}
) {
  const queryClient = useQueryClient();

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (newTeam: { name: string }) => {
      console.log('Creating team - Input data:', {
        eventId,
        selectedModalityId,
        userInfo,
        isOrganizer,
        userId
      });

      if (!eventId || !selectedModalityId) {
        throw new Error('Missing event ID or modality ID');
      }
      
      console.log('Creating team with userInfo:', userInfo);
      console.log('Is organizer:', isOrganizer);
      
      // Determine branch ID based on profile
      const branch_id = isOrganizer ? null : userInfo?.filial_id;
      
      console.log('Branch ID for team creation:', branch_id);
      
      // Branch ID is required for non-organizers
      if (!isOrganizer && !branch_id) {
        console.error('Missing branch ID for delegation representative. UserInfo:', userInfo);
        console.error('UserId:', userId);
        console.error('EventId:', eventId);
        throw new Error('Informações do usuário não carregadas. Tente novamente em alguns segundos.');
      }
      
      const teamData = {
        nome: newTeam.name,
        evento_id: eventId,
        modalidade_id: selectedModalityId,
        filial_id: branch_id,
        created_by: userId
      };
      
      console.log('Creating team with data:', teamData);
      
      const { data, error } = await supabase
        .from('equipes')
        .insert(teamData)
        .select('id')
        .single();
      
      if (error) {
        console.error('Error creating team:', error);
        throw error;
      }
      
      console.log('Team created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['teams', eventId, selectedModalityId, isOrganizer, userInfo?.filial_id] 
      });
      setTeamName('');
      toast.success("Equipe criada", {
        description: 'A equipe foi criada com sucesso'
      });
    },
    onError: (error) => {
      console.error('Team creation error:', error);
      toast.error("Erro", {
        description: error.message || 'Não foi possível criar a equipe'
      });
    }
  });

  // Handle team creation
  const handleCreateTeam = () => {
    console.log('handleCreateTeam called with:', {
      teamName,
      userInfo,
      isOrganizer
    });

    if (!teamName.trim()) {
      toast.error("Nome obrigatório", {
        description: 'Por favor, informe um nome para a equipe'
      });
      return;
    }

    // Check if userInfo is loaded for non-organizers
    if (!isOrganizer && !userInfo) {
      toast.error("Carregando dados", {
        description: 'Aguarde o carregamento das informações do usuário'
      });
      return;
    }
    
    createTeamMutation.mutate({ name: teamName });
  };

  return { createTeamMutation, handleCreateTeam };
}
