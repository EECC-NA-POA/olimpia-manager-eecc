
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Team, AvailableAthlete } from '../types';

interface EnrolledAthlete {
  id: number;
  atleta_id: string;
  equipe_id: number | null;
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
      if (!modalityId || !eventId) {
        return [];
      }
      
      try {
        // Get all enrollments for this modality
        let query = supabase
          .from('inscricoes_modalidades')
          .select(`
            id,
            atleta_id,
            equipe_id,
            usuarios(
              nome_completo,
              tipo_documento,
              numero_documento
            )
          `)
          .eq('modalidade_id', modalityId)
          .eq('evento_id', eventId)
          .eq('status', 'confirmado');

        // If not organizer, filter by branch
        if (!isOrganizer && branchId) {
          const { data: branchAthletes, error: branchError } = await supabase
            .from('usuarios')
            .select('id')
            .eq('filial_id', branchId);
          
          if (branchError) throw branchError;
          
          const athleteIds = branchAthletes.map(a => a.id);
          if (athleteIds.length) {
            query = query.in('atleta_id', athleteIds);
          } else {
            return [];
          }
        }

        const { data: enrolledAthletes, error: enrollmentError } = await query;
        
        if (enrollmentError) {
          console.error('Error fetching enrolled athletes:', enrollmentError);
          toast.error('Não foi possível carregar os atletas');
          return [];
        }

        // If organizer, just return all athletes (they can't modify teams)
        if (isOrganizer) {
          return [];
        }

        // Extract athletes that are not yet assigned to a team
        const availableAthletes: AvailableAthlete[] = [];
        
        if (enrolledAthletes) {
          for (const item of enrolledAthletes) {
            // Skip if item is null
            if (!item) continue;
            
            // Skip athletes already in a team
            if (item.equipe_id !== null) continue;
            
            // Handle the usuarios data, ensuring it's treated as an object and not an array
            const userData = item.usuarios as UserInfo | null;
            
            availableAthletes.push({
              atleta_id: item.atleta_id,
              name: userData?.nome_completo || 'Atleta',
              atleta_nome: userData?.nome_completo || 'Atleta',
              documento_tipo: userData?.tipo_documento || 'Documento',
              documento_numero: userData?.numero_documento || '',
              identificador: '',
              tipo_documento: userData?.tipo_documento || 'Documento',
              numero_documento: userData?.numero_documento || '',
              numero_identificador: null
            });
          }
        }

        console.log('Available athletes found:', availableAthletes.length);
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
