
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
    queryKey: ['available-athletes', eventId, selectedModalityId, teams.map(t => t.atletas.map(a => a.atleta_id)).flat().join(',')],
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

      // Get all athletes already in teams for this modality from database
      const { data: athletesInTeams, error: teamsError } = await supabase
        .from('atletas_equipes')
        .select(`
          atleta_id,
          equipes!inner(modalidade_id, evento_id)
        `)
        .eq('equipes.modalidade_id', selectedModalityId)
        .eq('equipes.evento_id', eventId);

      if (teamsError) {
        console.error('Error fetching athletes in teams:', teamsError);
      }

      // Create set of athlete IDs that are already in teams
      const athletesInTeamsSet = new Set(
        athletesInTeams?.map(item => item.atleta_id) || []
      );
      
      console.log('Athletes already in teams from DB:', Array.from(athletesInTeamsSet));
      
      return enrollments
        .filter(enrollment => !athletesInTeamsSet.has(enrollment.atleta_id))
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
