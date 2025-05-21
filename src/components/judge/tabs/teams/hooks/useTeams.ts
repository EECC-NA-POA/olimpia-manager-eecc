
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Team, TeamAthlete } from '../types';

export function useTeams(
  eventId: string | null,
  selectedModalityId: number | null,
  isOrganizer = false,
  filialId?: string
) {
  // Explicitly define the return type to avoid deep type instantiation
  type TeamsQueryResult = {
    existingTeams: Team[];
    isLoadingTeams: boolean;
  };

  // Fetch existing teams
  const { data: existingTeams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams', eventId, selectedModalityId, isOrganizer, filialId],
    queryFn: async (): Promise<Team[]> => {
      if (!eventId || !selectedModalityId) return [];
      
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
          return [];
        }
        
        if (!teamsData || !Array.isArray(teamsData)) {
          return [];
        }
        
        // Map teams with explicit typing
        const teams: Team[] = [];
        
        for (const team of teamsData) {
          // Skip invalid team data
          if (!team || typeof team !== 'object' || !('id' in team) || !('nome' in team)) {
            continue;
          }
          
          // Create team object
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
          } else if (athletesData && Array.isArray(athletesData)) {
            // Process athletes
            for (const item of athletesData) {
              if (!item || typeof item !== 'object') continue;
              
              // Access usuario properties safely
              const usuario = item.usuarios || {};
              const userRecord = usuario as Record<string, any>;
              
              // Create athlete
              const athlete: TeamAthlete = {
                id: item.id || 0,
                posicao: item.posicao || 0,
                raia: item.raia || null,
                atleta_id: item.atleta_id || '',
                usuarios: {
                  nome_completo: userRecord.nome_completo || '',
                  email: userRecord.email || '',
                  telefone: userRecord.telefone || '',
                  tipo_documento: userRecord.tipo_documento || '',
                  numero_documento: userRecord.numero_documento || ''
                }
              };
              
              teamObj.athletes.push(athlete);
            }
          }
          
          teams.push(teamObj);
        }
        
        return teams;
      } catch (err) {
        console.error("Error in useTeams:", err);
        return [];
      }
    },
    enabled: !!eventId && !!selectedModalityId,
  });

  return { existingTeams, isLoadingTeams };
}
