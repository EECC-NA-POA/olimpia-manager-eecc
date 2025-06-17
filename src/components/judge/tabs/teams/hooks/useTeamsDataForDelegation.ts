
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { TeamData } from '../types';

export function useTeamsDataForDelegation(
  eventId: string | null,
  modalityId: number | null,
  branchId?: string | null
) {
  return useQuery({
    queryKey: ['teams-delegation', eventId, modalityId, branchId],
    queryFn: async (): Promise<TeamData[]> => {
      if (!eventId || !modalityId) return [];

      console.log('Fetching teams for delegation:', { eventId, modalityId, branchId });

      // Get teams for the specific modality
      let teamsQuery = supabase
        .from('equipes')
        .select(`
          id,
          nome,
          modalidade_id,
          evento_id,
          created_by,
          modalidades!inner(
            nome,
            categoria,
            tipo_pontuacao
          )
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId);

      const { data: teamsData, error: teamsError } = await teamsQuery;

      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        throw new Error('Não foi possível carregar as equipes');
      }

      if (!teamsData || teamsData.length === 0) return [];

      // For each team, get its athletes and filter by branch if specified
      const teamsWithAthletes = await Promise.all(
        teamsData.map(async (team) => {
          // Get athletes for this team
          let athletesQuery = supabase
            .from('atletas_equipes')
            .select(`
              id,
              atleta_id,
              posicao,
              raia,
              usuarios!inner(
                nome_completo,
                tipo_documento,
                numero_documento,
                filial_id,
                filiais(nome)
              )
            `)
            .eq('equipe_id', team.id);

          const { data: athletesData, error: athletesError } = await athletesQuery;

          if (athletesError) {
            console.error('Error fetching team athletes:', athletesError);
            return {
              ...team,
              atletas: []
            };
          }

          // Filter athletes by branch if branchId is provided
          let filteredAthletes = athletesData || [];
          if (branchId) {
            filteredAthletes = athletesData?.filter(athlete => {
              const usuario = Array.isArray(athlete.usuarios) ? athlete.usuarios[0] : athlete.usuarios;
              return usuario?.filial_id === branchId;
            }) || [];
          }

          // Transform athletes data
          const atletas = filteredAthletes.map(athlete => {
            const usuario = Array.isArray(athlete.usuarios) ? athlete.usuarios[0] : athlete.usuarios;
            const filial = usuario?.filiais 
              ? (Array.isArray(usuario.filiais) ? usuario.filiais[0] : usuario.filiais)
              : null;

            return {
              id: athlete.id,
              atleta_id: athlete.atleta_id,
              nome: usuario?.nome_completo || '',
              documento: `${usuario?.tipo_documento || ''}: ${usuario?.numero_documento || ''}`,
              posicao: athlete.posicao,
              raia: athlete.raia,
              filial_nome: filial?.nome || 'N/A'
            };
          });

          // If filtering by branch and no athletes from that branch, don't include the team
          if (branchId && atletas.length === 0) {
            return null;
          }

          const modalidade = Array.isArray(team.modalidades) ? team.modalidades[0] : team.modalidades;

          return {
            id: team.id,
            nome: team.nome,
            modalidade_id: team.modalidade_id,
            modalidade_nome: modalidade?.nome || '',
            modalidade_categoria: modalidade?.categoria || '',
            tipo_pontuacao: modalidade?.tipo_pontuacao || 'maior_melhor',
            atletas
          };
        })
      );

      // Filter out null teams (teams with no athletes from the specified branch)
      return teamsWithAthletes.filter(team => team !== null) as TeamData[];
    },
    enabled: !!eventId && !!modalityId,
  });
}
