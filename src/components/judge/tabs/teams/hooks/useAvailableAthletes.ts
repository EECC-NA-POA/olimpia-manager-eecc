
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
  branchId?: string | null,
  teams?: any[] // Add teams parameter to filter out already added athletes
) {
  const { user } = useAuth();
  const userBranchId = user?.filial_id;

  return useQuery({
    queryKey: ['available-athletes', selectedModalityId, eventId, isOrganizer ? 'organizer' : branchId || userBranchId, teams?.length || 0],
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

      // Get athletes already in teams for this modality
      const athletesInTeams = new Set();
      if (teams && teams.length > 0) {
        teams.forEach(team => {
          if (team.athletes && team.athletes.length > 0) {
            team.athletes.forEach(athlete => {
              athletesInTeams.add(athlete.atleta_id);
            });
          }
        });
      }

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
