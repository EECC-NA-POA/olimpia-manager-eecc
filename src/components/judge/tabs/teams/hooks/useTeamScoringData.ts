
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Team {
  equipe_id: number;
  equipe_nome: string;
  modalidade_id: number;
  modalidade_nome: string;
  members: Array<{
    atleta_id: string;
    atleta_nome: string;
    numero_identificador?: string;
  }>;
}

interface UseTeamScoringDataProps {
  eventId: string | null;
  modalityFilter?: number | null;
  branchFilter?: string | null;
  searchTerm?: string;
  userBranchId?: string;
}

export function useTeamScoringData({
  eventId,
  modalityFilter,
  branchFilter,
  searchTerm,
  userBranchId
}: UseTeamScoringDataProps) {
  const { data: teams = [], isLoading, error } = useQuery({
    queryKey: ['team-scoring-data', eventId, modalityFilter, branchFilter, searchTerm, userBranchId],
    queryFn: async () => {
      if (!eventId) return [];

      console.log('Fetching team scoring data for event:', eventId);

      let query = supabase
        .from('equipes')
        .select(`
          id,
          nome,
          modalidade_id,
          filial_id,
          modalidades!inner (
            id,
            nome,
            tipo_pontuacao,
            categoria,
            modelos_modalidade (
              id,
              codigo_modelo,
              descricao
            )
          ),
          atletas_equipes (
            atleta_id,
            usuarios!inner (
              nome_completo,
              numero_identificador
            )
          )
        `)
        .eq('evento_id', eventId);

      // Apply filters
      if (modalityFilter) {
        query = query.eq('modalidade_id', modalityFilter);
      }

      if (branchFilter) {
        query = query.eq('filial_id', branchFilter);
      }

      if (userBranchId) {
        query = query.eq('filial_id', userBranchId);
      }

      const { data, error } = await query.order('nome');

      if (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }

      console.log('Raw teams data:', data);

      const transformedTeams: Team[] = (data || []).map(team => ({
        equipe_id: team.id,
        equipe_nome: team.nome,
        modalidade_id: team.modalidade_id,
        modalidade_nome: Array.isArray(team.modalidades) ? team.modalidades[0]?.nome || '' : team.modalidades?.nome || '',
        members: (team.atletas_equipes || []).map(ae => ({
          atleta_id: ae.atleta_id,
          atleta_nome: Array.isArray(ae.usuarios) ? ae.usuarios[0]?.nome_completo || '' : ae.usuarios?.nome_completo || '',
          numero_identificador: Array.isArray(ae.usuarios) ? ae.usuarios[0]?.numero_identificador || '' : ae.usuarios?.numero_identificador || ''
        }))
      }));

      // Apply search filter
      let filteredTeams = transformedTeams;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredTeams = transformedTeams.filter(team =>
          team.equipe_nome.toLowerCase().includes(searchLower) ||
          team.modalidade_nome.toLowerCase().includes(searchLower) ||
          team.members.some(member =>
            member.atleta_nome.toLowerCase().includes(searchLower)
          )
        );
      }

      console.log('Transformed and filtered teams:', filteredTeams);
      return filteredTeams;
    },
    enabled: !!eventId,
  });

  return {
    teams,
    isLoading,
    error
  };
}
