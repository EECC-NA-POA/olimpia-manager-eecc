
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TeamAthlete {
  id: number;
  atleta_id: string;
  atleta_nome: string;
  posicao: number;
  raia?: number;
  tipo_documento?: string;
  numero_documento?: string;
  usuarios?: {
    nome_completo: string;
    tipo_documento?: string;
    numero_documento?: string;
  };
}

interface Team {
  id: number;
  nome: string;
  modalidade_id: number;
  modalidade: string;
  modalidades: {
    nome: string;
    categoria: string;
  };
  athletes: TeamAthlete[];
}

export function useTeams(
  userId: string,
  eventId: string | null,
  modalityId: number | null,
  branchId?: string | null,
  isOrganizer = false
) {
  return useQuery({
    queryKey: ['teams', eventId, modalityId, isOrganizer, branchId],
    queryFn: async (): Promise<Team[]> => {
      try {
        console.log('Fetching teams:', { eventId, modalityId, branchId, isOrganizer });
        
        if (!eventId || !modalityId) {
          return [];
        }
        
        // Build the query based on user role
        let query = supabase
          .from('equipes')
          .select(`
            id,
            nome,
            modalidade_id
          `)
          .eq('evento_id', eventId)
          .eq('modalidade_id', modalityId);
        
        // For delegation representatives, filter by their branch
        if (!isOrganizer && branchId) {
          query = query.eq('filial_id', branchId);
        }
        
        const { data: teamsData, error } = await query;

        if (error) {
          console.error('Error fetching teams:', error);
          throw error;
        }

        console.log('Teams data fetched:', teamsData);

        if (!teamsData || teamsData.length === 0) {
          console.log('No teams found for this modality');
          return [];
        }

        // Fetch modality info separately to avoid complex joins
        const { data: modalityData } = await supabase
          .from('modalidades')
          .select('id, nome, categoria, tipo_modalidade')
          .eq('id', modalityId)
          .eq('tipo_modalidade', 'coletivo')
          .single();

        // Process teams data
        const processedTeams: Team[] = [];
        
        for (const teamRow of teamsData) {
          const baseTeam: Team = {
            id: teamRow.id,
            nome: teamRow.nome,
            modalidade_id: teamRow.modalidade_id,
            modalidade: modalityData?.nome || '',
            modalidades: {
              nome: modalityData?.nome || '',
              categoria: modalityData?.categoria || ''
            },
            athletes: []
          };

          // Fetch team athletes separately
          try {
            const { data: athletesData, error: athletesError } = await supabase
              .from('atletas_equipes')
              .select(`
                id,
                atleta_id,
                posicao,
                raia,
                usuarios!inner (
                  nome_completo,
                  tipo_documento,
                  numero_documento
                )
              `)
              .eq('equipe_id', teamRow.id);

            if (athletesError) {
              console.error('Error fetching team athletes:', athletesError);
            } else if (athletesData && athletesData.length > 0) {
              baseTeam.athletes = athletesData.map(athleteRow => ({
                id: athleteRow.id,
                atleta_id: athleteRow.atleta_id,
                atleta_nome: athleteRow.usuarios?.nome_completo || 'Atleta',
                posicao: athleteRow.posicao || 0,
                raia: athleteRow.raia || undefined,
                tipo_documento: athleteRow.usuarios?.tipo_documento,
                numero_documento: athleteRow.usuarios?.numero_documento,
                usuarios: {
                  nome_completo: athleteRow.usuarios?.nome_completo || 'Atleta',
                  tipo_documento: athleteRow.usuarios?.tipo_documento,
                  numero_documento: athleteRow.usuarios?.numero_documento
                }
              }));
            }
          } catch (athleteError) {
            console.error('Error processing athletes for team:', teamRow.id, athleteError);
          }
          
          processedTeams.push(baseTeam);
        }

        console.log('Teams fetched successfully:', processedTeams);
        return processedTeams;

      } catch (error) {
        console.error('Error in teams query:', error);
        return [];
      }
    },
    enabled: !!eventId && !!modalityId
  });
}
