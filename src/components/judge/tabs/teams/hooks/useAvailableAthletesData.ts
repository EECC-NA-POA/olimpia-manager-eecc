
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
    queryKey: ['available-athletes-simple', eventId, selectedModalityId, branchId, teams.length],
    queryFn: async (): Promise<AthleteOption[]> => {
      if (!eventId || !selectedModalityId || isOrganizer || !branchId) return [];

      console.log('Fetching available athletes for modality:', selectedModalityId);

      // Get enrolled athletes in this modality from this branch
      const { data: enrollments, error } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          atleta_id,
          usuarios!inner(
            nome_completo,
            tipo_documento,
            numero_documento,
            filial_id
          )
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', selectedModalityId)
        .eq('status', 'confirmado')
        .eq('usuarios.filial_id', branchId);

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
          // Since we're using !inner join, usuarios will be a single object, not an array
          const usuario = Array.isArray(enrollment.usuarios) 
            ? enrollment.usuarios[0] 
            : enrollment.usuarios;
          
          return {
            id: enrollment.atleta_id,
            nome: usuario?.nome_completo || '',
            documento: `${usuario?.tipo_documento || ''}: ${usuario?.numero_documento || ''}`
          };
        });
    },
    enabled: !!eventId && !!selectedModalityId && !isOrganizer && !!branchId,
  });
}
