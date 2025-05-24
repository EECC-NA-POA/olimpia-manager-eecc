
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { TeamData, ModalityOption } from '../types';

interface Branch {
  id: string;
  nome: string;
}

export function useAllTeamsData(
  eventId: string | null,
  modalityFilter: number | null,
  branchFilter: string | null,
  searchTerm: string
) {
  const teamsQuery = useQuery({
    queryKey: ['all-teams', eventId, modalityFilter, branchFilter, searchTerm],
    queryFn: async () => {
      if (!eventId) return [];

      console.log('Fetching teams with filters:', { eventId, modalityFilter, branchFilter, searchTerm });

      let query = supabase
        .from('equipes')
        .select(`
          id,
          nome,
          modalidade_id,
          evento_id,
          filial_id,
          modalidades(
            id,
            nome,
            categoria,
            tipo_modalidade
          ),
          filiais(
            id,
            nome
          )
        `)
        .eq('evento_id', eventId);

      // Apply modality filter
      if (modalityFilter) {
        query = query.eq('modalidade_id', modalityFilter);
      }

      // Apply branch filter
      if (branchFilter) {
        query = query.eq('filial_id', branchFilter);
      }

      // Apply search filter
      if (searchTerm) {
        query = query.ilike('nome', `%${searchTerm}%`);
      }

      const { data: teamsData, error } = await query;
      
      console.log('Teams query result:', { teamsData, error });
      
      if (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }

      if (!teamsData) return [];

      // Process teams with athletes
      const processedTeams: TeamData[] = [];
      
      for (const team of teamsData) {
        console.log('Processing team:', team);
        
        // Get team athletes with branch information
        const { data: athletesData, error: athletesError } = await supabase
          .from('atletas_equipes')
          .select(`
            id,
            atleta_id,
            posicao,
            raia,
            usuarios(
              nome_completo,
              tipo_documento,
              numero_documento,
              filiais(nome)
            )
          `)
          .eq('equipe_id', team.id);

        if (athletesError) {
          console.error('Error fetching athletes for team:', team.id, athletesError);
        }

        const atletas = athletesData?.map(athlete => {
          // Handle usuarios as array (first element)
          const usuario = Array.isArray(athlete.usuarios) 
            ? athlete.usuarios[0] 
            : athlete.usuarios;
          
          // Handle filiais as array (first element)
          const filial = usuario?.filiais 
            ? (Array.isArray(usuario.filiais) ? usuario.filiais[0] : usuario.filiais)
            : null;

          return {
            id: athlete.id,
            atleta_id: athlete.atleta_id,
            atleta_nome: usuario?.nome_completo || '',
            posicao: athlete.posicao || 0,
            raia: athlete.raia,
            documento: `${usuario?.tipo_documento || ''}: ${usuario?.numero_documento || ''}`,
            filial_nome: filial?.nome || 'N/A'
          };
        }) || [];

        // Handle modalidades data properly - get first element if array
        const modalidadeData = Array.isArray(team.modalidades) 
          ? team.modalidades[0] 
          : team.modalidades;
        
        processedTeams.push({
          id: team.id,
          nome: team.nome,
          modalidade_id: team.modalidade_id,
          filial_id: team.filial_id,
          evento_id: team.evento_id,
          modalidade_info: modalidadeData ? {
            id: modalidadeData.id,
            nome: modalidadeData.nome,
            categoria: modalidadeData.categoria,
            tipo_modalidade: modalidadeData.tipo_modalidade || 'coletiva'
          } : undefined,
          atletas
        });
      }

      console.log('Final processed teams:', processedTeams);
      return processedTeams;
    },
    enabled: !!eventId,
  });

  // Query for modalities
  const modalitiesQuery = useQuery({
    queryKey: ['all-modalities', eventId],
    queryFn: async (): Promise<ModalityOption[]> => {
      if (!eventId) return [];

      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, categoria, tipo_modalidade')
        .eq('evento_id', eventId)
        .order('nome');

      if (error) throw error;
      return data || [];
    },
    enabled: !!eventId,
  });

  // Query for branches
  const branchesQuery = useQuery({
    queryKey: ['all-branches', eventId],
    queryFn: async (): Promise<Branch[]> => {
      if (!eventId) return [];

      const { data, error } = await supabase
        .from('filiais')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      return data || [];
    },
    enabled: !!eventId,
  });

  return {
    teams: teamsQuery.data || [],
    modalities: modalitiesQuery.data || [],
    branches: branchesQuery.data || [],
    isLoading: teamsQuery.isLoading || modalitiesQuery.isLoading || branchesQuery.isLoading,
    error: teamsQuery.error || modalitiesQuery.error || branchesQuery.error
  };
}
