
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

      // First, get all teams for the event
      let teamsQuery = supabase
        .from('equipes')
        .select('id, nome, modalidade_id')
        .eq('evento_id', eventId);

      if (modalityFilter) {
        teamsQuery = teamsQuery.eq('modalidade_id', modalityFilter);
      }

      const { data: teamsData, error: teamsError } = await teamsQuery.order('nome');

      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        throw teamsError;
      }

      console.log('Teams data:', teamsData);

      if (!teamsData || teamsData.length === 0) {
        console.log('No teams found');
        return [];
      }

      const transformedTeams: Team[] = [];

      // Process each team
      for (const team of teamsData) {
        console.log('Processing team:', team);

        // Get modality information
        const { data: modalityData, error: modalityError } = await supabase
          .from('modalidades')
          .select('id, nome, categoria, tipo_modalidade')
          .eq('id', team.modalidade_id)
          .single();

        if (modalityError) {
          console.error('Error fetching modality:', modalityError);
          continue;
        }

        // Only process collective modalities
        if (modalityData?.tipo_modalidade !== 'coletiva') {
          console.log('Skipping non-collective modality:', modalityData?.nome);
          continue;
        }

        // Get team athletes
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
          console.error('Error fetching team athletes:', athletesError);
        }

        console.log('Athletes data for team', team.nome, ':', athletesData);

        // Transform athletes data
        const members = (athletesData || []).map(athlete => {
          const usuario = Array.isArray(athlete.usuarios) 
            ? athlete.usuarios[0] 
            : athlete.usuarios;
          
          return {
            atleta_id: athlete.atleta_id,
            atleta_nome: usuario?.nome_completo || '',
            numero_identificador: '' // Will be fetched separately if needed
          };
        });

        // Get payment info for numero_identificador if needed
        for (const member of members) {
          const { data: paymentData } = await supabase
            .from('pagamentos')
            .select('numero_identificador')
            .eq('atleta_id', member.atleta_id)
            .eq('evento_id', eventId)
            .single();

          if (paymentData?.numero_identificador) {
            member.numero_identificador = paymentData.numero_identificador;
          }
        }

        const transformedTeam: Team = {
          equipe_id: team.id,
          equipe_nome: team.nome,
          modalidade_id: team.modalidade_id,
          modalidade_nome: modalityData?.nome || '',
          modalidade_categoria: modalityData?.categoria || '',
          members
        };

        transformedTeams.push(transformedTeam);
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
