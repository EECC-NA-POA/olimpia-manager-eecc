
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Explicit interfaces to prevent type recursion
interface DbTeam {
  id: number;
  nome: string;
  modalidade_id: number;
}

interface DbModality {
  nome: string;
  categoria: string;
}

interface DbAthleteTeam {
  id: number;
  atleta_id: string;
  posicao: number;
  raia?: number;
}

interface DbUser {
  nome_completo: string;
  tipo_documento?: string;
  numero_documento?: string;
}

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
          console.log('Missing eventId or modalityId, returning empty array');
          return [];
        }
        
        // Fetch teams with explicit typing
        let teamsQuery = supabase
          .from('equipes')
          .select('id, nome, modalidade_id')
          .eq('evento_id', eventId)
          .eq('modalidade_id', modalityId);
        
        // For delegation representatives, filter by their branch
        if (!isOrganizer && branchId) {
          teamsQuery = teamsQuery.eq('filial_id', branchId);
        }
        
        const { data: teamsData, error: teamsError } = await teamsQuery;

        if (teamsError) {
          console.error('Error fetching teams:', teamsError);
          throw teamsError;
        }

        console.log('Teams data fetched:', teamsData);

        if (!teamsData || teamsData.length === 0) {
          console.log('No teams found for this modality');
          return [];
        }

        const typedTeamsData = teamsData as DbTeam[];

        // Fetch modality info separately
        const { data: modalityData, error: modalityError } = await supabase
          .from('modalidades')
          .select('nome, categoria')
          .eq('id', modalityId)
          .single();

        if (modalityError) {
          console.error('Error fetching modality:', modalityError);
        }

        const typedModalityData = modalityData as DbModality | null;

        // Process teams data
        const processedTeams: Team[] = [];
        
        for (const teamRow of typedTeamsData) {
          const baseTeam: Team = {
            id: teamRow.id,
            nome: teamRow.nome,
            modalidade_id: teamRow.modalidade_id,
            modalidade: typedModalityData?.nome || '',
            modalidades: {
              nome: typedModalityData?.nome || '',
              categoria: typedModalityData?.categoria || ''
            },
            athletes: []
          };

          // Fetch team athletes
          try {
            const { data: athletesData, error: athletesError } = await supabase
              .from('atletas_equipes')
              .select('id, atleta_id, posicao, raia')
              .eq('equipe_id', teamRow.id);

            if (athletesError) {
              console.error('Error fetching team athletes:', athletesError);
            } else if (athletesData && athletesData.length > 0) {
              const typedAthletesData = athletesData as DbAthleteTeam[];
              
              // Fetch user data for each athlete
              for (const athleteRow of typedAthletesData) {
                const { data: userData, error: userError } = await supabase
                  .from('usuarios')
                  .select('nome_completo, tipo_documento, numero_documento')
                  .eq('id', athleteRow.atleta_id)
                  .single();

                if (userError) {
                  console.error('Error fetching user data:', userError);
                }

                const typedUserData = userData as DbUser | null;

                const athlete: TeamAthlete = {
                  id: athleteRow.id,
                  atleta_id: athleteRow.atleta_id,
                  atleta_nome: typedUserData?.nome_completo || 'Atleta',
                  posicao: athleteRow.posicao || 0,
                  raia: athleteRow.raia || undefined,
                  tipo_documento: typedUserData?.tipo_documento,
                  numero_documento: typedUserData?.numero_documento,
                  usuarios: {
                    nome_completo: typedUserData?.nome_completo || 'Atleta',
                    tipo_documento: typedUserData?.tipo_documento,
                    numero_documento: typedUserData?.numero_documento
                  }
                };

                baseTeam.athletes.push(athlete);
              }
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
