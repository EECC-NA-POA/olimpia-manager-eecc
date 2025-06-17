
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useTeamsData(eventId: string | null, branchId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['teams', eventId, branchId, user?.id, user?.filial_id],
    queryFn: async () => {
      if (!eventId || !user?.id) {
        console.log('useTeamsData - Missing eventId or user:', { eventId, userId: user?.id });
        return [];
      }
      
      console.log('useTeamsData - Fetching teams for:', { eventId, userId: user.id, branchId, filialId: user.filial_id });
      
      // Para representantes de delegação, buscar apenas equipes criadas por usuários da mesma filial
      // Primeiro, buscar todos os usuários da mesma filial
      const { data: branchUsers, error: branchUsersError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('filial_id', user.filial_id);
        
      if (branchUsersError) {
        console.error('Error fetching branch users:', branchUsersError);
        throw new Error('Não foi possível carregar os usuários da filial');
      }
      
      const branchUserIds = branchUsers?.map(u => u.id) || [];
      console.log('Branch user IDs:', branchUserIds);
      
      // Agora buscar equipes criadas por estes usuários
      const { data, error } = await supabase
        .from('equipes')
        .select(`
          id,
          nome,
          modalidade_id,
          created_by,
          modalidades (
            nome,
            categoria
          )
        `)
        .eq('evento_id', eventId)
        .in('created_by', branchUserIds);
      
      if (error) {
        console.error('Error fetching teams:', error);
        throw new Error('Não foi possível carregar as equipes');
      }
      
      console.log('useTeamsData - Raw data:', data);
      
      // Map the teams to match the expected Team type
      const mappedTeams = data?.map(team => {
        // Check if modalidades is an array and extract the first item if so
        const modalidadeData = Array.isArray(team.modalidades) ? team.modalidades[0] : team.modalidades;
        
        return {
          id: team.id,
          nome: team.nome,
          modalidade_id: team.modalidade_id,
          modalidades: {
            nome: modalidadeData?.nome,
            categoria: modalidadeData?.categoria
          }
        };
      });
      
      console.log('useTeamsData - Mapped teams:', mappedTeams);
      
      return mappedTeams || [];
    },
    enabled: !!eventId && !!user?.id,
  });
}
