
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
    queryKey: ['available-athletes-simple', eventId, selectedModalityId, branchId],
    queryFn: async (): Promise<AthleteOption[]> => {
      if (!eventId || !selectedModalityId || isOrganizer || !branchId) return [];

      // Get enrolled athletes in this modality from this branch
      const { data: enrollments } = await supabase
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

      if (!enrollments) return [];

      // Filter out athletes already in teams
      const athletesInTeams = new Set(teams.flatMap(team => team.atletas.map(a => a.atleta_id)));
      
      return enrollments
        .filter(enrollment => !athletesInTeams.has(enrollment.atleta_id))
        .map(enrollment => ({
          id: enrollment.atleta_id,
          nome: enrollment.usuarios[0]?.nome_completo || '',
          documento: `${enrollment.usuarios[0]?.tipo_documento || ''}: ${enrollment.usuarios[0]?.numero_documento || ''}`
        }));
    },
    enabled: !!eventId && !!selectedModalityId && !isOrganizer && !!branchId,
  });
}
