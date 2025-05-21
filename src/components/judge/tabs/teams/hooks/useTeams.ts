
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
      
      try {
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
        
        if (teamsData && Array.isArray(teamsData)) {
          for (const team of teamsData) {
            // Skip invalid team data
            if (!team || typeof team !== 'object' || !('id' in team) || !('nome' in team)) {
              continue;
            }
            
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
            } else if (athletesData && Array.isArray(athletesData) && athletesData.length > 0) {
              teamObj.athletes = athletesData.map(item => {
                if (!item || typeof item !== 'object') {
                  return {
                    id: 0,
                    posicao: 0,
                    raia: null,
                    atleta_id: '',
                    usuarios: {
                      nome_completo: '',
                      email: '',
                      telefone: '',
                      tipo_documento: '',
                      numero_documento: ''
                    }
                  };
                }
                
                return {
                  id: item.id || 0,
                  posicao: item.posicao || 0,
                  raia: item.raia || null,
                  atleta_id: item.atleta_id || '',
                  usuarios: {
                    nome_completo: item.usuarios?.nome_completo || '',
                    email: item.usuarios?.email || '',
                    telefone: item.usuarios?.telefone || '',
                    tipo_documento: item.usuarios?.tipo_documento || '',
                    numero_documento: item.usuarios?.numero_documento || ''
                  }
                };
              });
            }
            
            teams.push(teamObj);
          }
        }
        
        return teams;
      } catch (err) {
        console.error("Error in useTeams:", err);
        return [] as Team[];
      }
    },
    enabled: !!eventId && !!selectedModalityId,
  });

  return { existingTeams, isLoadingTeams };
}
