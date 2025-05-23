
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user } = useAuth();

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (newTeam: { name: string }) => {
      console.log('Creating team - Input data:', {
        eventId,
        selectedModalityId,
        userInfo,
        isOrganizer,
        userId,
        authUser: user
      });

      if (!eventId || !selectedModalityId) {
        throw new Error('Dados do evento ou modalidade não encontrados');
      }
      
      // Determine branch ID based on profile
      let branch_id = null;
      
      if (!isOrganizer) {
        // Try to get branch_id from userInfo first, then from auth context
        branch_id = userInfo?.filial_id || user?.filial_id;
        
        console.log('Branch ID for team creation:', branch_id);
        
        if (!branch_id) {
          console.error('Missing branch ID for delegation representative. UserInfo:', userInfo, 'AuthUser:', user);
          throw new Error('Informações da filial não foram carregadas. Por favor, atualize a página e tente novamente.');
        }
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
        queryKey: ['teams', eventId, selectedModalityId, isOrganizer, userInfo?.filial_id || user?.filial_id] 
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
      isOrganizer,
      authUser: user
    });

    if (!teamName.trim()) {
      toast.error("Nome obrigatório", {
        description: 'Por favor, informe um nome para a equipe'
      });
      return;
    }

    // For non-organizers, check if we have branch info
    if (!isOrganizer) {
      const hasBranchInfo = userInfo?.filial_id || user?.filial_id;
      
      if (!hasBranchInfo) {
        toast.error("Informações não carregadas", {
          description: 'Aguarde o carregamento das informações da filial ou atualize a página'
        });
        return;
      }
    }
    
    createTeamMutation.mutate({ name: teamName });
  };

  return { createTeamMutation, handleCreateTeam };
}
