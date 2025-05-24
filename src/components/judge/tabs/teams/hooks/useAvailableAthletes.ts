
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AvailableAthlete, Team } from '../types';

export function useAvailableAthletes(
  eventId: string | null,
  modalityId: number | null,
  isOrganizer: boolean = false,
  branchId?: string | null,
  existingTeams: Team[] = []
) {
  const { data: availableAthletes, isLoading, error } = useQuery({
    queryKey: ['available-athletes', modalityId, eventId, branchId, existingTeams?.length],
    queryFn: async () => {
      try {
        console.log('Fetching available athletes with params:', {
          eventId,
          modalityId,
          isOrganizer,
          branchId,
          existingTeamsCount: existingTeams.length
        });

        if (!eventId || !modalityId) {
          console.log('Missing eventId or modalityId');
          return [];
        }

        // Se for organizador, retorna array vazio (não pode modificar equipes)
        if (isOrganizer) {
          console.log('User is organizer, returning empty array');
          return [];
        }

        // Buscar atletas inscritos na modalidade usando inner join
        console.log('Querying enrollments for modality:', modalityId, 'event:', eventId);
        
        let query = supabase
          .from('inscricoes_modalidades')
          .select(`
            atleta_id,
            usuarios!inner (
              id,
              nome_completo,
              tipo_documento,
              numero_documento,
              filial_id
            )
          `)
          .eq('modalidade_id', modalityId)
          .eq('evento_id', eventId)
          .eq('status', 'confirmado');

        // Se não for organizador, filtrar pela filial usando a tabela usuarios
        if (!isOrganizer && branchId) {
          console.log('Filtering by branch ID:', branchId);
          // Use a different approach to filter by branch
          const { data: branchUsers } = await supabase
            .from('usuarios')
            .select('id')
            .eq('filial_id', branchId);
          
          if (branchUsers && branchUsers.length > 0) {
            const userIds = branchUsers.map(u => u.id);
            query = query.in('atleta_id', userIds);
          } else {
            return [];
          }
        }

        const { data: enrolledAthletes, error: enrollmentError } = await query;
        
        if (enrollmentError) {
          console.error('Error fetching enrolled athletes:', enrollmentError);
          throw new Error('Erro ao buscar atletas inscritos: ' + enrollmentError.message);
        }

        console.log('Enrolled athletes found:', enrolledAthletes?.length || 0);

        if (!enrolledAthletes || enrolledAthletes.length === 0) {
          console.log('No athletes found for this modality and branch');
          return [];
        }

        // Coletar IDs dos atletas já em equipes
        const existingAthleteIds = new Set<string>();
        if (existingTeams && existingTeams.length > 0) {
          for (const team of existingTeams) {
            if (team.athletes && team.athletes.length > 0) {
              team.athletes.forEach(athlete => {
                existingAthleteIds.add(athlete.atleta_id);
              });
            }
          }
        }

        console.log('Existing athlete IDs in teams:', Array.from(existingAthleteIds));

        // Filtrar atletas disponíveis (não estão em nenhuma equipe)
        const availableAthletes: AvailableAthlete[] = [];
        
        for (const enrollment of enrolledAthletes) {
          // Verificar se o atleta já está em uma equipe
          if (existingAthleteIds.has(enrollment.atleta_id)) {
            console.log(`Athlete ${enrollment.atleta_id} already in a team, skipping`);
            continue;
          }

          const usuario = enrollment.usuarios;
          if (!usuario) {
            console.log(`No user data found for athlete ${enrollment.atleta_id}, skipping`);
            continue;
          }

          const athlete: AvailableAthlete = {
            atleta_id: enrollment.atleta_id,
            name: usuario.nome_completo || 'Atleta',
            atleta_nome: usuario.nome_completo || 'Atleta',
            documento_tipo: usuario.tipo_documento || 'CPF',
            documento_numero: usuario.numero_documento || '',
            identificador: '',
            tipo_documento: usuario.tipo_documento || 'CPF',
            numero_documento: usuario.numero_documento || '',
            numero_identificador: null
          };
          
          availableAthletes.push(athlete);
          console.log(`Added available athlete: ${athlete.atleta_nome} (${athlete.atleta_id})`);
        }

        console.log('Final available athletes:', availableAthletes.length);
        return availableAthletes;
        
      } catch (error) {
        console.error('Error in available athletes query:', error);
        throw error;
      }
    },
    enabled: !!modalityId && !!eventId && !isOrganizer,
    retry: 1,
    retryDelay: 1000
  });

  return { 
    availableAthletes: availableAthletes || [], 
    isLoadingAthletes: isLoading,
    athletesError: error 
  };
}
