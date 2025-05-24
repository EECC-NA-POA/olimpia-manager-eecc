
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface AvailableAthlete {
  id: string;
  nome: string;
  documento: string;
  filial_nome?: string;
}

export function useAvailableAthletes(
  eventId: string | null,
  selectedModalityId: number | null,
  isOrganizer: boolean = false,
  branchId?: string | null
) {
  const { user } = useAuth();
  const userBranchId = user?.filial_id;

  return useQuery({
    queryKey: ['available-athletes', selectedModalityId, eventId, isOrganizer ? 'organizer' : branchId || userBranchId],
    queryFn: async (): Promise<AvailableAthlete[]> => {
      if (!eventId || !selectedModalityId) return [];

      console.log('Fetching available athletes for modality:', selectedModalityId, 'isOrganizer:', isOrganizer);

      // Base query to get enrolled athletes in this modality
      let query = supabase
        .from('inscricoes_modalidades')
        .select(`
          atleta_id,
          usuarios!inner(
            nome_completo,
            tipo_documento,
            numero_documento,
            filial_id,
            filiais!inner(nome)
          )
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', selectedModalityId)
        .eq('status', 'confirmado');

      // If not organizer, filter by branch
      if (!isOrganizer && (branchId || userBranchId)) {
        query = query.eq('usuarios.filial_id', branchId || userBranchId);
      }

      const { data: enrollments, error } = await query;

      if (error) {
        console.error('Error fetching enrollments:', error);
        return [];
      }

      if (!enrollments) return [];

      console.log('Found enrollments:', enrollments.length);

      // For organizers, don't filter out athletes already in teams - they should be able to move athletes between teams
      if (isOrganizer) {
        return enrollments.map(enrollment => {
          // Handle usuarios data properly
          const usuario = Array.isArray(enrollment.usuarios) 
            ? enrollment.usuarios[0] 
            : enrollment.usuarios;
          
          // Handle filiais data properly  
          const filial = usuario?.filiais 
            ? (Array.isArray(usuario.filiais) ? usuario.filiais[0] : usuario.filiais)
            : null;

          return {
            id: enrollment.atleta_id,
            nome: usuario?.nome_completo || '',
            documento: `${usuario?.tipo_documento || ''}: ${usuario?.numero_documento || ''}`,
            filial_nome: filial?.nome || 'N/A'
          };
        });
      }

      // For non-organizers, filter out athletes already in teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('equipes')
        .select(`
          id,
          atletas_equipes!inner(atleta_id)
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', selectedModalityId);

      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
      }

      const athletesInTeams = new Set(
        teamsData?.flatMap(team => 
          team.atletas_equipes.map(ae => ae.atleta_id)
        ) || []
      );

      console.log('Athletes already in teams:', Array.from(athletesInTeams));
      
      return enrollments
        .filter(enrollment => !athletesInTeams.has(enrollment.atleta_id))
        .map(enrollment => {
          // Handle usuarios data properly
          const usuario = Array.isArray(enrollment.usuarios) 
            ? enrollment.usuarios[0] 
            : enrollment.usuarios;
          
          // Handle filiais data properly  
          const filial = usuario?.filiais 
            ? (Array.isArray(usuario.filiais) ? usuario.filiais[0] : usuario.filiais)
            : null;

          return {
            id: enrollment.atleta_id,
            nome: usuario?.nome_completo || '',
            documento: `${usuario?.tipo_documento || ''}: ${usuario?.numero_documento || ''}`,
            filial_nome: filial?.nome || 'N/A'
          };
        });
    },
    enabled: !!eventId && !!selectedModalityId,
  });
}
