
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AthleteOption } from '../types';

export function useAvailableAthletes(
  eventId: string | null, 
  selectedModalityId: number | null, 
  isOrganizer: boolean
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['available-athletes', eventId, selectedModalityId, isOrganizer, user?.filial_id],
    queryFn: async () => {
      if (!eventId || !selectedModalityId) return [];

      console.log('Fetching available athletes for modality:', selectedModalityId, 'isOrganizer:', isOrganizer);

      // First get all athletes already in teams for this modality
      const { data: teamAthletes } = await supabase
        .from('atletas_equipes')
        .select(`
          atleta_id,
          equipes!inner(modalidade_id, evento_id)
        `)
        .eq('equipes.evento_id', eventId)
        .eq('equipes.modalidade_id', selectedModalityId);

      const athletesInTeams = teamAthletes?.map(ta => ta.atleta_id) || [];
      console.log('Athletes already in teams from DB:', athletesInTeams);

      // Get enrollments for this modality
      let enrollmentsQuery = supabase
        .from('inscricoes')
        .select(`
          atleta_id,
          usuarios!inner(
            nome_completo,
            filial_id,
            filiais!inner(nome)
          ),
          pagamentos(numero_identificador)
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', selectedModalityId)
        .eq('status', 'confirmada');

      // For non-organizers (delegation representatives), filter by branch
      if (!isOrganizer && user?.filial_id) {
        enrollmentsQuery = enrollmentsQuery.eq('usuarios.filial_id', user.filial_id);
      }

      const { data: enrollments, error } = await enrollmentsQuery;

      if (error) {
        console.error('Error fetching enrollments:', error);
        throw error;
      }

      console.log('Found enrollments:', enrollments?.length);

      if (!enrollments) return [];

      // Filter out athletes already in teams and format the data
      const availableAthletes: AthleteOption[] = enrollments
        .filter(enrollment => !athletesInTeams.includes(enrollment.atleta_id))
        .map(enrollment => {
          const usuario = Array.isArray(enrollment.usuarios) 
            ? enrollment.usuarios[0] 
            : enrollment.usuarios;
          
          const filial = usuario?.filiais 
            ? (Array.isArray(usuario.filiais) ? usuario.filiais[0] : usuario.filiais)
            : null;

          const pagamento = Array.isArray(enrollment.pagamentos)
            ? enrollment.pagamentos[0]
            : enrollment.pagamentos;

          return {
            id: enrollment.atleta_id,
            nome: usuario?.nome_completo || '',
            filial_nome: filial?.nome || 'N/A',
            numero_identificador: pagamento?.numero_identificador || undefined
          };
        });

      console.log('Available athletes after filtering:', availableAthletes);
      return availableAthletes;
    },
    enabled: !!eventId && !!selectedModalityId,
  });
}
