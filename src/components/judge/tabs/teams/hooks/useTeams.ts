
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SimpleTeam {
  id: number;
  nome: string;
  modalidade_id: number;
  modalidade?: string;
  modalidades?: {
    nome?: string;
    categoria?: string;
  };
  athletes?: SimpleTeamAthlete[];
}

interface SimpleTeamAthlete {
  id: number;
  atleta_id: string;
  atleta_nome: string;
  posicao: number;
  raia?: number;
  tipo_documento?: string;
  numero_documento?: string;
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
    queryFn: async (): Promise<SimpleTeam[]> => {
      console.log('Fetching teams:', { eventId, modalityId, branchId, isOrganizer });
      
      if (!eventId || !modalityId) {
        console.log('Missing eventId or modalityId, returning empty array');
        return [];
      }
      
      try {
        // Fetch teams
        let query = supabase
          .from('equipes')
          .select('id, nome, modalidade_id')
          .eq('evento_id', eventId)
          .eq('modalidade_id', modalityId);
        
        if (!isOrganizer && branchId) {
          query = query.eq('filial_id', branchId);
        }
        
        const { data: teams, error } = await query;

        if (error) {
          console.error('Error fetching teams:', error);
          return [];
        }

        if (!teams) {
          return [];
        }

        // Fetch modality info
        const { data: modalityData } = await supabase
          .from('modalidades')
          .select('nome, categoria')
          .eq('id', modalityId)
          .single();

        // Process each team
        const processedTeams: SimpleTeam[] = [];
        
        for (const team of teams) {
          // Fetch team athletes
          const { data: athletes } = await supabase
            .from('atletas_equipes')
            .select('id, atleta_id, posicao, raia')
            .eq('equipe_id', team.id);

          const teamAthletes: SimpleTeamAthlete[] = [];
          
          if (athletes) {
            for (const athlete of athletes) {
              const { data: userData } = await supabase
                .from('usuarios')
                .select('nome_completo, tipo_documento, numero_documento')
                .eq('id', athlete.atleta_id)
                .single();

              teamAthletes.push({
                id: athlete.id,
                atleta_id: athlete.atleta_id,
                atleta_nome: userData?.nome_completo || 'Atleta',
                posicao: athlete.posicao || 0,
                raia: athlete.raia,
                tipo_documento: userData?.tipo_documento,
                numero_documento: userData?.numero_documento
              });
            }
          }

          processedTeams.push({
            id: team.id,
            nome: team.nome,
            modalidade_id: team.modalidade_id,
            modalidade: modalityData?.nome || '',
            modalidades: {
              nome: modalityData?.nome || '',
              categoria: modalityData?.categoria || ''
            },
            athletes: teamAthletes
          });
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
