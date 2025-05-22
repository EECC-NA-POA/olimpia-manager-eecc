
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Team, AvailableAthlete } from '../types';

interface EnrolledAthlete {
  id: number;
  atleta_id: string;
  equipe_id: number | null;
  usuarios: {
    nome_completo: string;
    tipo_documento: string;
    numero_documento: string;
    numero_identificador: string | null;
  } | null;
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
            usuarios:atleta_id (
              nome_completo,
              tipo_documento,
              numero_documento,
              numero_identificador
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
            
            // Add the athlete to available list if user data exists
            // Ensure that we access usuarios as a single object, not an array
            const userInfo = item.usuarios || {};
            
            availableAthletes.push({
              atleta_id: item.atleta_id,
              name: userInfo.nome_completo || 'Atleta',
              atleta_nome: userInfo.nome_completo || 'Atleta',
              documento_tipo: userInfo.tipo_documento || 'Documento',
              documento_numero: userInfo.numero_documento || '',
              identificador: userInfo.numero_identificador || '',
              tipo_documento: userInfo.tipo_documento || 'Documento',
              numero_documento: userInfo.numero_documento || '',
              numero_identificador: userInfo.numero_identificador
            });
          }
        }

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
