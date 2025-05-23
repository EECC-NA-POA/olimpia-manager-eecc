
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
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
    queryFn: async () => {
      try {
        console.log('Fetching teams:', { eventId, modalityId, branchId, isOrganizer });
        
        // Build the query based on user role
        let query = supabase
          .from('equipes')
          .select(`
            id,
            nome,
            observacoes,
            modalidade_id,
            modalidades (
              nome,
              categoria
            )
          `)
          .eq('evento_id', eventId!)
          .eq('modalidade_id', modalityId!);
        
        // For delegation representatives, filter by their branch
        if (!isOrganizer && branchId) {
          query = query.eq('filial_id', branchId);
        }
        
        const { data: teamsData, error } = await query;

        if (error) {
          console.error('Error fetching teams:', error);
          throw error;
        }

        if (!teamsData || teamsData.length === 0) {
          return [];
        }

        // Process teams data to match Team interface
        const teams: Team[] = teamsData.map(team => {
          // Check if modalidades is an array and extract the first item if so
          const modalidadeData = Array.isArray(team.modalidades) ? team.modalidades[0] : team.modalidades;
          
          return {
            id: team.id,
            nome: team.nome,
            observacoes: team.observacoes || undefined,
            modalidade_id: team.modalidade_id,
            modalidade: modalidadeData?.nome,
            modalidades: {
              nome: modalidadeData?.nome,
              categoria: modalidadeData?.categoria
            },
            athletes: []
          };
        });

        // For each team, fetch its athletes
        for (const team of teams) {
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

          team.athletes = teamAthletes.map(athlete => {
            // Handle the usuarios data, ensuring it's treated as an object not an array
            const usuariosData = Array.isArray(athlete.usuarios) ? athlete.usuarios[0] : athlete.usuarios;
            
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

        console.log('Teams fetched successfully:', teams);
        return teams;

      } catch (error) {
        console.error('Error in teams query:', error);
        toast.error('Erro ao carregar equipes');
        return [];
      }
    },
    enabled: !!eventId && !!modalityId
  });
}
