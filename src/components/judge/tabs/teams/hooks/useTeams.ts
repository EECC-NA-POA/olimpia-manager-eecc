
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Team } from '../types';

// Define a simpler interface for the query result
interface TeamQueryResult {
  id: number;
  nome: string;
  cor_uniforme: string | null;
  observacoes: string | null;
  filial_id: string;
  evento_id: string;
}

export function useTeams(
  eventId: string | null, 
  modalityId: number | null, 
  isOrganizer: boolean = false,
  branchId?: string | null
) {
  const { data: existingTeams, isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams', modalityId, eventId, branchId, isOrganizer],
    queryFn: async () => {
      if (!modalityId || !eventId) {
        return [];
      }

      try {
        let query = supabase
          .from('equipes')
          .select('*')
          .eq('evento_id', eventId)
          .eq('modalidade_id', modalityId);
        
        // For delegation reps, filter by branch
        if (!isOrganizer && branchId) {
          query = query.eq('filial_id', branchId);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching teams:', error);
          toast.error('Não foi possível carregar as equipes');
          return [];
        }
        
        // Map to a simpler structure to avoid deep instantiation issues
        const teams: Team[] = (data || []).map((team: TeamQueryResult) => ({
          id: team.id,
          nome: team.nome,
          cor_uniforme: team.cor_uniforme || '',
          observacoes: team.observacoes || '',
          filial_id: team.filial_id,
          evento_id: team.evento_id,
          members: [] // Initialize empty members array
        }));

        return teams;
      } catch (error) {
        console.error('Error in teams query:', error);
        toast.error('Erro ao buscar equipes');
        return [];
      }
    },
    enabled: !!modalityId && !!eventId
  });

  return {
    existingTeams,
    isLoadingTeams
  };
}
