
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Simple, non-recursive interfaces
interface SimpleTeam {
  id: number;
  nome: string;
  modalidade_id: number;
}

interface SimpleModality {
  nome: string;
  categoria: string;
}

interface SimpleAthleteTeam {
  id: number;
  atleta_id: string;
  posicao: number;
  raia?: number;
}

interface SimpleUser {
  nome_completo: string;
  tipo_documento?: string;
  numero_documento?: string;
}

// Final result interfaces
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
      console.log('Fetching teams:', { eventId, modalityId, branchId, isOrganizer });
      
      if (!eventId || !modalityId) {
        console.log('Missing eventId or modalityId, returning empty array');
        return [];
      }
      
      try {
        // Step 1: Fetch teams
        let teamsQuery = supabase
          .from('equipes')
          .select('id, nome, modalidade_id')
          .eq('evento_id', eventId)
          .eq('modalidade_id', modalityId);
        
        if (!isOrganizer && branchId) {
          teamsQuery = teamsQuery.eq('filial_id', branchId);
        }
        
        const { data: teamsData, error: teamsError } = await teamsQuery;

        if (teamsError) {
          console.error('Error fetching teams:', teamsError);
          return [];
        }

        if (!teamsData || teamsData.length === 0) {
          console.log('No teams found for this modality');
          return [];
        }

        // Step 2: Fetch modality info
        const { data: modalityData, error: modalityError } = await supabase
          .from('modalidades')
          .select('nome, categoria')
          .eq('id', modalityId)
          .single();

        if (modalityError) {
          console.error('Error fetching modality:', modalityError);
        }

        const modality = modalityData as SimpleModality | null;

        // Step 3: Process each team
        const processedTeams: Team[] = [];
        
        for (const teamData of teamsData as SimpleTeam[]) {
          const team: Team = {
            id: teamData.id,
            nome: teamData.nome,
            modalidade_id: teamData.modalidade_id,
            modalidade: modality?.nome || '',
            modalidades: {
              nome: modality?.nome || '',
              categoria: modality?.categoria || ''
            },
            athletes: []
          };

          // Step 4: Fetch team athletes
          const { data: athletesData, error: athletesError } = await supabase
            .from('atletas_equipes')
            .select('id, atleta_id, posicao, raia')
            .eq('equipe_id', teamData.id);

          if (athletesError) {
            console.error('Error fetching team athletes:', athletesError);
          } else if (athletesData && athletesData.length > 0) {
            // Step 5: Fetch user data for each athlete
            for (const athleteData of athletesData as SimpleAthleteTeam[]) {
              const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('nome_completo, tipo_documento, numero_documento')
                .eq('id', athleteData.atleta_id)
                .single();

              if (userError) {
                console.error('Error fetching user data:', userError);
              }

              const user = userData as SimpleUser | null;

              const athlete: TeamAthlete = {
                id: athleteData.id,
                atleta_id: athleteData.atleta_id,
                atleta_nome: user?.nome_completo || 'Atleta',
                posicao: athleteData.posicao || 0,
                raia: athleteData.raia || undefined,
                tipo_documento: user?.tipo_documento,
                numero_documento: user?.numero_documento,
                usuarios: {
                  nome_completo: user?.nome_completo || 'Atleta',
                  tipo_documento: user?.tipo_documento,
                  numero_documento: user?.numero_documento
                }
              };

              team.athletes.push(athlete);
            }
          }
          
          processedTeams.push(team);
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
