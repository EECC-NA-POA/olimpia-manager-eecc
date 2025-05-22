
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useTeamCreation(
  userId: string,
  eventId: string | null,
  selectedModalityId: number | null,
  filialId?: string | null,
  isOrganizer = false,
  teamName = '',
  setTeamName: (name: string) => void = () => {}
) {
  const queryClient = useQueryClient();

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (newTeam: { name: string }) => {
      if (!eventId || !selectedModalityId) {
        throw new Error('Missing event ID or modality ID');
      }
      
      // Determine branch ID based on profile
      const branch_id = isOrganizer ? null : filialId;
      
      // Branch ID is required for non-organizers
      if (!isOrganizer && !branch_id) {
        throw new Error('Missing branch ID for delegation representative');
      }
      
      console.log('Creating team with data:', {
        nome: newTeam.name,
        evento_id: eventId,
        modalidade_id: selectedModalityId,
        filial_id: branch_id,
        created_by: userId
      });
      
      const { data, error } = await supabase
        .from('equipes')
        .insert({
          nome: newTeam.name,
          evento_id: eventId,
          modalidade_id: selectedModalityId,
          filial_id: branch_id,
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
        queryKey: ['teams', eventId, selectedModalityId, isOrganizer, filialId] 
      });
      setTeamName('');
      toast({
        title: "Equipe criada",
        description: 'A equipe foi criada com sucesso',
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('Team creation error:', error);
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

  return { createTeamMutation, handleCreateTeam };
}
