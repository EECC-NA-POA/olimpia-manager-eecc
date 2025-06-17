
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

  // Check if user is delegation representative
  const isDelegationRep = user?.papeis?.some(role => role.codigo === 'RDD') || false;

  return useQuery({
    queryKey: ['available-athletes', eventId, selectedModalityId, isOrganizer, user?.filial_id, isDelegationRep],
    queryFn: async () => {
      if (!eventId || !selectedModalityId) return [];

      console.log('Fetching available athletes for modality:', selectedModalityId, 'isOrganizer:', isOrganizer, 'isDelegationRep:', isDelegationRep, 'userFilialId:', user?.filial_id);

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

      // Build the base query for available athletes
      let enrollmentsQuery = supabase
        .from('inscricoes_modalidades')
        .select(`
          atleta_id,
          usuarios!inner(
            nome_completo,
            filial_id,
            tipo_documento,
            numero_documento,
            filiais!inner(nome)
          ),
          pagamentos(numero_identificador)
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', selectedModalityId)
        .eq('status', 'confirmado');

      // CRITICAL: Apply branch filtering DIRECTLY on the join condition
      if (isDelegationRep && user?.filial_id) {
        console.log('Applying DELEGATION REP branch filter for filial_id:', user.filial_id);
        // Filter directly on the usuarios table through the join
        enrollmentsQuery = enrollmentsQuery.eq('usuarios.filial_id', user.filial_id);
      } else if (!isOrganizer && user?.filial_id) {
        console.log('Applying NON-ORGANIZER branch filter for filial_id:', user.filial_id);
        enrollmentsQuery = enrollmentsQuery.eq('usuarios.filial_id', user.filial_id);
      } else {
        console.log('NO BRANCH FILTER APPLIED - showing all athletes (organizer mode)');
      }

      const { data: enrollments, error } = await enrollmentsQuery;

      if (error) {
        console.error('Error fetching enrollments:', error);
        throw error;
      }

      console.log('Found enrollments:', enrollments?.length);
      console.log('Enrollments data:', enrollments);

      if (!enrollments) return [];

      // Filter out athletes already in teams and format the data
      const availableAthletes: AthleteOption[] = enrollments
        .filter(enrollment => {
          const isInTeam = athletesInTeams.includes(enrollment.atleta_id);
          console.log(`Athlete ${enrollment.atleta_id} in team: ${isInTeam}`);
          return !isInTeam;
        })
        .filter(enrollment => {
          // Double-check branch filtering for delegation representatives
          const usuario = Array.isArray(enrollment.usuarios) 
            ? enrollment.usuarios[0] 
            : enrollment.usuarios;
          
          if (isDelegationRep && user?.filial_id) {
            const matches = usuario?.filial_id === user.filial_id;
            console.log(`Branch filter check - Athlete ${enrollment.atleta_id}, filial_id: ${usuario?.filial_id}, user filial_id: ${user.filial_id}, matches: ${matches}`);
            return matches;
          }
          
          return true;
        })
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

          console.log('Processing athlete:', {
            atleta_id: enrollment.atleta_id,
            nome: usuario?.nome_completo,
            filial_id: usuario?.filial_id,
            filial_nome: filial?.nome,
            user_filial_id: user?.filial_id,
            isDelegationRep,
            isOrganizer
          });

          return {
            id: enrollment.atleta_id,
            nome: usuario?.nome_completo || '',
            documento: `${usuario?.tipo_documento || ''}: ${usuario?.numero_documento || ''}`,
            filial_nome: filial?.nome || 'N/A',
            numero_identificador: pagamento?.numero_identificador || undefined
          };
        });

      console.log('Available athletes after filtering:', availableAthletes);
      console.log('Final athlete count:', availableAthletes.length);
      
      return availableAthletes;
    },
    enabled: !!eventId && !!selectedModalityId,
  });
}
