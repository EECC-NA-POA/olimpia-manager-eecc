
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Team {
  equipe_id: number;
  equipe_nome: string;
  modalidade_id: number;
  modalidade_nome: string;
  modalidade_categoria: string;
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

      // Get all teams for the event with modality info
      let teamsQuery = supabase
        .from('equipes')
        .select(`
          id,
          nome,
          modalidade_id,
          modalidades!inner (
            id,
            nome,
            categoria,
            tipo_modalidade
          )
        `)
        .eq('evento_id', eventId);

      if (modalityFilter) {
        teamsQuery = teamsQuery.eq('modalidade_id', modalityFilter);
      }

      const { data: teamsData, error: teamsError } = await teamsQuery.order('nome');

      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        throw teamsError;
      }

      console.log('Teams data fetched:', teamsData);

      if (!teamsData || teamsData.length === 0) {
        console.log('No teams found');
        return [];
      }

      const transformedTeams: Team[] = [];

      // Process each team
      for (const team of teamsData) {
        console.log('Processing team:', team);

        // Only process collective modalities - note: using 'coletivo' not 'coletiva'
        const modality = Array.isArray(team.modalidades) ? team.modalidades[0] : team.modalidades;
        if (modality?.tipo_modalidade !== 'coletivo') {
          console.log('Skipping non-collective modality:', modality?.nome, 'type:', modality?.tipo_modalidade);
          continue;
        }

        console.log('Processing collective modality team:', team.nome);

        // Get team athletes using the correct table structure
        const { data: athletesData, error: athletesError } = await supabase
          .from('atletas_equipes')
          .select(`
            atleta_id,
            usuarios!inner (
              nome_completo
            )
          `)
          .eq('equipe_id', team.id);

        if (athletesError) {
          console.error('Error fetching team athletes for team', team.nome, ':', athletesError);
          // Continue processing other teams even if this one fails
        }

        console.log('Athletes data for team', team.nome, ':', athletesData);

        // Transform athletes data
        const members = (athletesData || []).map(athlete => {
          const usuario = Array.isArray(athlete.usuarios) 
            ? athlete.usuarios[0] 
            : athlete.usuarios;
          
          return {
            atleta_id: athlete.atleta_id,
            atleta_nome: usuario?.nome_completo || 'Nome não encontrado',
            numero_identificador: '' // Will be fetched separately if needed
          };
        });

        // Get payment info for numero_identificador if needed
        for (const member of members) {
          try {
            const { data: paymentData } = await supabase
              .from('pagamentos')
              .select('numero_identificador')
              .eq('atleta_id', member.atleta_id)
              .eq('evento_id', eventId)
              .maybeSingle();

            if (paymentData?.numero_identificador) {
              member.numero_identificador = paymentData.numero_identificador;
            }
          } catch (error) {
            console.log('Could not fetch payment data for athlete:', member.atleta_id);
          }
        }

        const transformedTeam: Team = {
          equipe_id: team.id,
          equipe_nome: team.nome,
          modalidade_id: team.modalidade_id,
          modalidade_nome: modality?.nome || '',
          modalidade_categoria: modality?.categoria || '',
          members
        };

        transformedTeams.push(transformedTeam);
        console.log('Transformed team added:', transformedTeam);
      }

      // Apply search filter
      let filteredTeams = transformedTeams;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredTeams = transformedTeams.filter(team =>
          team.equipe_nome.toLowerCase().includes(searchLower) ||
          team.modalidade_nome.toLowerCase().includes(searchLower) ||
          team.modalidade_categoria.toLowerCase().includes(searchLower) ||
          team.members.some(member =>
            member.atleta_nome.toLowerCase().includes(searchLower)
          )
        );
      }

      console.log('Final transformed and filtered teams:', filteredTeams);
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
