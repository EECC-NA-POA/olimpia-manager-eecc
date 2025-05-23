
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Team, AvailableAthlete } from '../types';

interface EnrolledAthlete {
  id: number;
  atleta_id: string;
  usuarios: UserInfo | null;
}

interface UserInfo {
  nome_completo?: string;
  tipo_documento?: string;
  numero_documento?: string;
  numero_identificador?: string | null;
}

export function useAvailableAthletes(
  eventId: string | null,
  modalityId: number | null,
  isOrganizer: boolean = false,
  branchId?: string | null,
  existingTeams: Team[] = []
) {
  const { data: availableAthletes } = useQuery({
    queryKey: ['available-athletes', modalityId, eventId, branchId, existingTeams, isOrganizer],
    queryFn: async () => {
      try {
        console.log('Starting useAvailableAthletes query with params:', {
          eventId,
          modalityId,
          isOrganizer,
          branchId,
          existingTeamsCount: existingTeams.length
        });

        // Get all enrollments for this modality
        let query = supabase
          .from('inscricoes_modalidades')
          .select(`
            id,
            atleta_id,
            usuarios(
              nome_completo,
              tipo_documento,
              numero_documento
            )
          `)
          .eq('modalidade_id', modalityId!)
          .eq('evento_id', eventId!)
          .eq('status', 'confirmado');

        console.log('Querying enrollments for modality:', modalityId, 'event:', eventId);

        // If not organizer, filter by branch
        if (!isOrganizer && branchId) {
          console.log('Filtering by branch ID:', branchId);
          
          const { data: branchAthletes, error: branchError } = await supabase
            .from('usuarios')
            .select('id')
            .eq('filial_id', branchId);
          
          if (branchError) {
            console.error('Error fetching branch athletes:', branchError);
            throw branchError;
          }
          
          console.log('Found branch athletes:', branchAthletes?.length);
          
          const athleteIds = branchAthletes?.map(a => a.id) || [];
          if (athleteIds.length > 0) {
            query = query.in('atleta_id', athleteIds);
          } else {
            console.log('No athletes found for branch, returning empty array');
            return [];
          }
        }

        const { data: enrolledAthletes, error: enrollmentError } = await query;
        
        if (enrollmentError) {
          console.error('Error fetching enrolled athletes:', enrollmentError);
          toast.error('Não foi possível carregar os atletas');
          return [];
        }

        console.log('Enrolled athletes found:', enrolledAthletes?.length || 0);
        console.log('Enrolled athletes data:', enrolledAthletes);

        // If organizer, just return empty array (they can't modify teams)
        if (isOrganizer) {
          console.log('User is organizer, returning empty array');
          return [];
        }

        // Get the existing athlete IDs from teams
        const existingAthleteIds = existingTeams.flatMap(team => 
          team.athletes?.map(athlete => athlete.atleta_id) || []
        );
        
        console.log('Existing athlete IDs in teams:', existingAthleteIds);

        // Extract athletes that are not yet assigned to a team
        const availableAthletes: AvailableAthlete[] = [];
        
        if (enrolledAthletes) {
          for (const item of enrolledAthletes) {
            // Skip if item is null
            if (!item) {
              console.log('Skipping null enrollment item');
              continue;
            }
            
            // Skip athletes already in a team
            if (existingAthleteIds.includes(item.atleta_id)) {
              console.log(`Athlete ${item.atleta_id} already in a team, skipping`);
              continue;
            }
            
            // Handle the usuarios data, ensuring it's treated as an object and not an array
            const userData = Array.isArray(item.usuarios) 
              ? item.usuarios[0] 
              : item.usuarios as UserInfo | null;
            
            if (!userData) {
              console.log(`No user data found for athlete ${item.atleta_id}, skipping`);
              continue;
            }
            
            const athlete: AvailableAthlete = {
              atleta_id: item.atleta_id,
              name: userData.nome_completo || 'Atleta',
              atleta_nome: userData.nome_completo || 'Atleta',
              documento_tipo: userData.tipo_documento || 'Documento',
              documento_numero: userData.numero_documento || '',
              identificador: '',
              tipo_documento: userData.tipo_documento || 'Documento',
              numero_documento: userData.numero_documento || '',
              numero_identificador: null
            };
            
            availableAthletes.push(athlete);
            console.log(`Added available athlete: ${athlete.atleta_nome} (${athlete.atleta_id})`);
          }
        }

        console.log('Available athletes found:', availableAthletes.length);
        console.log('Available athletes:', availableAthletes);
        return availableAthletes;
      } catch (error) {
        console.error('Error in available athletes query:', error);
        toast.error('Erro ao buscar atletas disponíveis');
        return [];
      }
    },
    enabled: !!modalityId && !!eventId && !isOrganizer
  });

  return { availableAthletes: availableAthletes || [] };
}
