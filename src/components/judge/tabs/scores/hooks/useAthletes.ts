
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Athlete {
  inscricao_id: number;
  atleta_id: string;
  atleta_nome: string;
  tipo_documento: string;
  numero_documento: string;
  filial_id?: number | null;
  filial_nome?: string | null;
}

// Interface to type the response from Supabase
interface AthleteResponse {
  id: number;
  atleta_id: string;
  usuarios: {
    nome_completo: string;
    tipo_documento: string;
    numero_documento: string;
    filial_id?: number | null;
  } | null;
}

interface FilialResponse {
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
        
        // Get the enrollments with user data including filial_id
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('inscricoes_modalidades')
          .select(`
            id,
            atleta_id,
            usuarios(
              nome_completo,
              tipo_documento,
              numero_documento,
              filial_id
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

        // Get unique filial IDs from users who have filial_id
        const filialIds = [...new Set(
          enrollments
            .map(e => e.usuarios?.filial_id)
            .filter(id => id !== null && id !== undefined)
        )] as number[];

        // Fetch filial data if there are filiais
        let filiaisData: FilialResponse[] = [];
        if (filialIds.length > 0) {
          const { data: filiais, error: filiaisError } = await supabase
            .from('filiais')
            .select('id, nome')
            .in('id', filialIds);

          if (filiaisError) {
            console.error('Error fetching filiais:', filiaisError);
            // Don't fail the whole query if filiais can't be loaded
          } else {
            filiaisData = filiais || [];
          }
        }

        console.log('Filiais data:', filiaisData);

        // Transform the data to match our Athlete interface
        const athletes = enrollments.map((item) => {
          const user = item.usuarios;
          const filial = filiaisData.find(f => f.id === user?.filial_id);
          
          return {
            inscricao_id: item.id,
            atleta_id: item.atleta_id,
            atleta_nome: user?.nome_completo || 'Atleta',
            tipo_documento: user?.tipo_documento || 'Documento',
            numero_documento: user?.numero_documento || '',
            filial_id: user?.filial_id,
            filial_nome: filial?.nome || null,
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
