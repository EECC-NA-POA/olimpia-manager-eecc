
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AthleteOption, TeamData } from '../types';

export function useAvailableAthletesData(
  eventId: string | null,
  selectedModalityId: number | null,
  isOrganizer: boolean,
  teams: TeamData[]
) {
  const { user } = useAuth();
  const branchId = user?.filial_id;

  return useQuery({
    queryKey: ['available-athletes-simple', eventId, selectedModalityId, isOrganizer ? 'organizer' : user?.id, teams.length],
    queryFn: async (): Promise<AthleteOption[]> => {
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

      // For organizers, show ALL athletes. For regular users, filter by branch
      if (!isOrganizer && branchId) {
        query = query.eq('usuarios.filial_id', branchId);
      }

      const { data: enrollments, error } = await query;

      if (error) {
        console.error('Error fetching enrollments:', error);
        return [];
      }

      if (!enrollments) return [];

      console.log('Found enrollments:', enrollments.length);

      // Filter out athletes already in teams
      const athletesInTeams = new Set(teams.flatMap(team => team.atletas.map(a => a.atleta_id)));
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
