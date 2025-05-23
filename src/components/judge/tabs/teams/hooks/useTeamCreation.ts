
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
        throw new Error('Dados do evento ou modalidade não encontrados');
      }
      
      // Check session first
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
      }
      
      // Determine branch ID based on profile
      const branch_id = isOrganizer ? null : userInfo?.filial_id;
      
      console.log('Branch ID for team creation:', branch_id);
      
      // Branch ID is required for non-organizers
      if (!isOrganizer && !branch_id) {
        console.error('Missing branch ID for delegation representative. UserInfo:', userInfo);
        throw new Error('Informações da filial não foram carregadas. Por favor, atualize a página e tente novamente.');
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
        if (error.message?.includes('JWT') || error.message?.includes('session')) {
          throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
        }
        throw new Error('Erro ao criar a equipe. Tente novamente.');
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
      const errorMessage = error.message || 'Não foi possível criar a equipe';
      
      if (errorMessage.includes('sessão') || errorMessage.includes('login')) {
        toast.error("Sessão expirada", {
          description: errorMessage
        });
        // Optionally trigger a page reload or redirect to login
        window.location.reload();
      } else {
        toast.error("Erro", {
          description: errorMessage
        });
      }
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
      toast.error("Informações não carregadas", {
        description: 'Aguarde o carregamento das informações ou atualize a página'
      });
      return;
    }
    
    createTeamMutation.mutate({ name: teamName });
  };

  return { createTeamMutation, handleCreateTeam };
}
