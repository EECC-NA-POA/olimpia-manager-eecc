
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Team } from '../types';

export function useTeams(
  eventId: string | null,
  selectedModalityId: number | null,
  isOrganizer = false,
  filialId?: string
) {
  // Fetch existing teams
  const { data: existingTeams, isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams', eventId, selectedModalityId, isOrganizer, filialId],
    queryFn: async () => {
      if (!eventId || !selectedModalityId) return [] as Team[];
      
      // Build the teams query
      let query = supabase
        .from('equipes')
        .select('id, nome')
        .eq('evento_id', eventId)
        .eq('modalidade_id', selectedModalityId);
      
      // Filter by branch if not an organizer
      if (!isOrganizer && filialId) {
        query = query.eq('filial_id', filialId);
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

  return { existingTeams, isLoadingTeams };
}
