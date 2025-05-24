

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Team } from '../types';

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
            modalidade_id,
            modalidades (
              nome,
              categoria
            )
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

        // Process teams data to match Team interface with explicit typing
        const teams: Team[] = [];
        
        for (const team of teamsData) {
          // Handle modalidades data with explicit type checking
          const modalidadeData = Array.isArray(team.modalidades) 
            ? team.modalidades[0] 
            : team.modalidades as { nome: string; categoria: string } | null;
          
          const processedTeam: Team = {
            id: team.id,
            nome: team.nome,
            modalidade_id: team.modalidade_id,
            modalidade: modalidadeData?.nome,
            modalidades: {
              nome: modalidadeData?.nome || '',
              categoria: modalidadeData?.categoria || ''
            },
            athletes: []
          };

          // Fetch team athletes with explicit typing
          const { data: teamAthletes, error: athletesError } = await supabase
            .from('atletas_equipes')
            .select(`
              id,
              atleta_id,
              posicao,
              raia,
              usuarios:atleta_id (
                nome_completo,
                tipo_documento,
                numero_documento
              )
            `)
            .eq('equipe_id', team.id);

          if (athletesError) {
            console.error('Error fetching team athletes:', athletesError);
            continue;
          }

          if (teamAthletes && teamAthletes.length > 0) {
            processedTeam.athletes = teamAthletes.map(athlete => {
              // Handle usuarios data with explicit typing
              const usuariosData = Array.isArray(athlete.usuarios) 
                ? athlete.usuarios[0] 
                : athlete.usuarios as { nome_completo: string; tipo_documento?: string; numero_documento?: string } | null;
              
              return {
                id: athlete.id,
                atleta_id: athlete.atleta_id,
                atleta_nome: usuariosData?.nome_completo || 'Atleta',
                posicao: athlete.posicao || 0,
                raia: athlete.raia || undefined,
                tipo_documento: usuariosData?.tipo_documento,
                numero_documento: usuariosData?.numero_documento,
                usuarios: {
                  nome_completo: usuariosData?.nome_completo || 'Atleta',
                  tipo_documento: usuariosData?.tipo_documento,
                  numero_documento: usuariosData?.numero_documento
                }
              };
            });
          }
          
          teams.push(processedTeam);
        }

        console.log('Teams fetched successfully:', teams);
        return teams;

      } catch (error) {
        console.error('Error in teams query:', error);
        return [];
      }
    },
    enabled: !!eventId && !!modalityId
  });
}

