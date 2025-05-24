
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
  searchTerm: string,
  userBranchId?: string
) {
  const teamsQuery = useQuery({
    queryKey: ['all-teams', eventId, modalityFilter, branchFilter, searchTerm, userBranchId],
    queryFn: async () => {
      if (!eventId) return [];

      console.log('Fetching teams with filters:', { eventId, modalityFilter, branchFilter, searchTerm, userBranchId });

      let query = supabase
        .from('equipes')
        .select(`
          id,
          nome,
          modalidade_id,
          evento_id
        `)
        .eq('evento_id', eventId);

      // Apply modality filter
      if (modalityFilter) {
        query = query.eq('modalidade_id', modalityFilter);
      }

      // Apply search filter - case insensitive
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

      // Process teams with athletes and modality info
      const processedTeams: TeamData[] = [];
      
      for (const team of teamsData) {
        console.log('Processing team:', team);
        
        // Get modality information separately
        const { data: modalityData, error: modalityError } = await supabase
          .from('modalidades')
          .select('id, nome, categoria, tipo_modalidade')
          .eq('id', team.modalidade_id)
          .single();

        if (modalityError) {
          console.error('Error fetching modality for team:', team.id, modalityError);
        }

        // Get team athletes with user and branch information
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

        // Determine the primary filial from athletes
        const primaryFilial = atletas.length > 0 ? atletas[0].filial_nome : 'N/A';
        
        // Apply branch filter if specified - compare by branch name, not ID
        if (branchFilter && branchFilter !== 'all') {
          // Get the branch name from the branch ID
          const { data: branchData } = await supabase
            .from('filiais')
            .select('nome')
            .eq('id', branchFilter)
            .single();
          
          const branchName = branchData?.nome;
          
          if (branchName) {
            const teamHasBranchAthletes = atletas.some(athlete => 
              athlete.filial_nome === branchName
            );
            if (!teamHasBranchAthletes) {
              continue; // Skip this team if it doesn't match the branch filter
            }
          }
        }
        
        processedTeams.push({
          id: team.id,
          nome: team.nome,
          modalidade_id: team.modalidade_id,
          filial_id: primaryFilial, // Use primary filial from athletes
          evento_id: team.evento_id,
          modalidade_info: modalityData ? {
            id: modalityData.id,
            nome: modalityData.nome,
            categoria: modalityData.categoria,
            tipo_modalidade: modalityData.tipo_modalidade || 'coletiva'
          } : undefined,
          atletas
        });
      }

      console.log('Final processed teams:', processedTeams);
      return processedTeams;
    },
    enabled: !!eventId,
  });

  // Query for modalities - only collective modalities for the filter
  const modalitiesQuery = useQuery({
    queryKey: ['all-modalities', eventId],
    queryFn: async (): Promise<ModalityOption[]> => {
      if (!eventId) return [];

      console.log('Fetching modalities for filter with eventId:', eventId);

      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, categoria, tipo_modalidade')
        .eq('evento_id', eventId)
        .eq('tipo_modalidade', 'coletiva') // Buscar modalidades coletivas
        .order('nome');

      console.log('Modalities query result:', { data, error });

      if (error) {
        console.error('Error fetching modalities:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!eventId,
  });

  // Query for branches - only show user's branch if userBranchId is provided
  const branchesQuery = useQuery({
    queryKey: ['all-branches', eventId, userBranchId],
    queryFn: async (): Promise<Branch[]> => {
      if (!eventId) return [];

      let query = supabase
        .from('filiais')
        .select('id, nome')
        .order('nome');

      // If userBranchId is provided, filter to show only that branch
      if (userBranchId) {
        query = query.eq('id', userBranchId);
      }

      const { data, error } = await query;

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
