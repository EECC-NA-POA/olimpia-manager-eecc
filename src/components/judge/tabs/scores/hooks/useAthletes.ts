
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Athlete {
  inscricao_id: number;
  atleta_id: string;
  atleta_nome: string;
  tipo_documento: string;
  numero_documento: string;
  equipe_id?: number | null;
  equipe_nome?: string | null;
}

// Interface to type the response from Supabase
interface AthleteResponse {
  id: number;
  atleta_id: string;
  equipe_id?: number | null;
  usuarios: {
    nome_completo: string;
    tipo_documento: string;
    numero_documento: string;
  } | null;
}

interface TeamResponse {
  id: number;
  nome: string;
}

export function useAthletes(modalityId: number | null, eventId: string | null) {
  const { data: athletes, isLoading: isLoadingAthletes } = useQuery({
    queryKey: ['athletes', modalityId, eventId],
    queryFn: async () => {
      if (!modalityId || !eventId) return [];

      try {
        console.log('Fetching athletes for modality:', modalityId, 'event:', eventId);
        
        // First, get the enrollments with user data
        const { data: enrollments, error: enrollmentsError } = await supabase
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

        if (enrollmentsError) {
          console.error('Error fetching enrollments:', enrollmentsError);
          toast.error('Não foi possível carregar os atletas');
          return [];
        }

        console.log('Raw enrollment data:', enrollments);

        if (!enrollments || enrollments.length === 0) {
          console.log('No enrollments found');
          return [];
        }

        // Get unique team IDs
        const teamIds = [...new Set(enrollments
          .map(e => e.equipe_id)
          .filter(id => id !== null))] as number[];

        // Fetch team data if there are teams
        let teamsData: TeamResponse[] = [];
        if (teamIds.length > 0) {
          const { data: teams, error: teamsError } = await supabase
            .from('equipes')
            .select('id, nome')
            .in('id', teamIds);

          if (teamsError) {
            console.error('Error fetching teams:', teamsError);
            // Don't fail the whole query if teams can't be loaded
          } else {
            teamsData = teams || [];
          }
        }

        console.log('Teams data:', teamsData);

        // Transform the data to match our Athlete interface
        const athletes = (enrollments as unknown as AthleteResponse[]).map((item) => {
          const team = teamsData.find(t => t.id === item.equipe_id);
          
          return {
            inscricao_id: item.id,
            atleta_id: item.atleta_id,
            atleta_nome: item.usuarios?.nome_completo || 'Atleta',
            tipo_documento: item.usuarios?.tipo_documento || 'Documento',
            numero_documento: item.usuarios?.numero_documento || '',
            equipe_id: item.equipe_id,
            equipe_nome: team?.nome || null,
          };
        });

        console.log('Processed athletes:', athletes);
        return athletes;
      } catch (error) {
        console.error('Error in athlete query execution:', error);
        toast.error('Erro ao buscar atletas');
        return [];
      }
    },
    enabled: !!modalityId && !!eventId,
  });

  return { athletes, isLoadingAthletes };
}
