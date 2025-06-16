
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

// Define the expected structure from Supabase - both modalidades and usuarios come as arrays due to joins
interface SupabaseTeamData {
  id: number;
  nome: string;
  modalidade_id: number;
  filial_id: string;
  modalidades: Array<{
    id: number;
    nome: string;
    tipo_pontuacao: string;
    categoria: string;
    modelos_modalidade: Array<{
      id: number;
      codigo_modelo: string;
      descricao: string;
    }>;
  }>;
  atletas_equipes: Array<{
    atleta_id: string;
    usuarios: Array<{
      nome_completo: string;
    }>;
  }>;
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
              nome_completo
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

      const transformedTeams: Team[] = (data as SupabaseTeamData[] || []).map(team => ({
        equipe_id: team.id,
        equipe_nome: team.nome,
        modalidade_id: team.modalidade_id,
        modalidade_nome: team.modalidades?.[0]?.nome || '',
        members: (team.atletas_equipes || []).map(ae => ({
          atleta_id: ae.atleta_id,
          atleta_nome: ae.usuarios?.[0]?.nome_completo || '',
          numero_identificador: '' // Removido a referência à coluna que não existe
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
