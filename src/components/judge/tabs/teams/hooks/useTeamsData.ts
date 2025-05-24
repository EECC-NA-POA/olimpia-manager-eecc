
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { TeamData, ModalityOption } from '../types';

export function useTeamsData(
  eventId: string | null, 
  selectedModalityId: number | null, 
  isOrganizer: boolean,
  modalities: ModalityOption[]
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['teams-data', eventId, selectedModalityId],
    queryFn: async () => {
      if (!eventId || !selectedModalityId) return [];

      console.log('Fetching teams for modality:', selectedModalityId, 'isOrganizer:', isOrganizer, 'userId:', user?.id);

      let query = supabase
        .from('equipes')
        .select(`
          id,
          nome,
          modalidade_id,
          evento_id,
          created_by
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', selectedModalityId);

      // For organizers: show ALL teams in this modality regardless of creator
      // For regular users: show only teams they created
      if (!isOrganizer) {
        query = query.eq('created_by', user?.id);
      }

      const { data: teamsData, error } = await query;
      
      console.log('Teams query result:', { teamsData, error, isOrganizer });
      
      if (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }

      if (!teamsData) return [];

      // Get modality info
      const modalityInfo = modalities.find(m => m.id === selectedModalityId);

      // Process teams with athletes
      const processedTeams: TeamData[] = [];
      
      for (const team of teamsData) {
        console.log('Processing team for management:', team);
        
        // Get team athletes with branch information
        const { data: athletesData } = await supabase
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
              filiais!inner(nome)
            )
          `)
          .eq('equipe_id', team.id);

        console.log('Athletes data for team', team.id, ':', athletesData);

        // Get payment information separately for each athlete
        const atletas = [];
        if (athletesData) {
          for (const athlete of athletesData) {
            // Handle usuarios data properly
            const usuario = Array.isArray(athlete.usuarios) 
              ? athlete.usuarios[0] 
              : athlete.usuarios;
            
            // Handle filiais data properly  
            const filial = usuario?.filiais 
              ? (Array.isArray(usuario.filiais) ? usuario.filiais[0] : usuario.filiais)
              : null;

            // Get payment data separately
            const { data: pagamentoData } = await supabase
              .from('pagamentos')
              .select('numero_identificador')
              .eq('atleta_id', athlete.atleta_id)
              .eq('evento_id', eventId)
              .single();

            atletas.push({
              id: athlete.id,
              atleta_id: athlete.atleta_id,
              atleta_nome: usuario?.nome_completo || '',
              posicao: athlete.posicao || 0,
              raia: athlete.raia,
              documento: `${usuario?.tipo_documento || ''}: ${usuario?.numero_documento || ''}`,
              filial_nome: filial?.nome || 'N/A',
              numero_identificador: pagamentoData?.numero_identificador || undefined
            });
          }
        }

        processedTeams.push({
          id: team.id,
          nome: team.nome,
          modalidade_id: team.modalidade_id,
          filial_id: '', // Not using filial_id from equipes table since it doesn't exist
          evento_id: team.evento_id,
          modalidade_info: modalityInfo,
          atletas
        });
      }

      console.log('Final processed teams for management:', processedTeams);
      return processedTeams;
    },
    enabled: !!eventId && !!selectedModalityId,
  });
}
