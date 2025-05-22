
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Athlete {
  inscricao_id: number;
  atleta_id: string;
  atleta_nome: string;
  tipo_documento: string;
  numero_documento: string;
  numero_identificador?: string | null;
  equipe_id?: number | null;
}

// Interface to type the response from Supabase
interface AthleteResponse {
  id: number;
  atleta_id: string;
  usuarios: {
    nome_completo: string;
    tipo_documento: string;
    numero_documento: string;
    numero_identificador?: string | null;
  } | null;
  equipe_id?: number | null;
}

export function useAthletes(modalityId: number | null, eventId: string | null) {
  const { data: athletes, isLoading: isLoadingAthletes } = useQuery({
    queryKey: ['athletes', modalityId, eventId],
    queryFn: async () => {
      if (!modalityId || !eventId) return [];

      try {
        const { data, error } = await supabase
          .from('inscricoes_modalidades')
          .select(`
            id,
            atleta_id,
            usuarios(
              nome_completo,
              tipo_documento,
              numero_documento,
              numero_identificador
            ),
            equipe_id
          `)
          .eq('modalidade_id', modalityId)
          .eq('evento_id', eventId)
          .eq('status', 'confirmado');

        if (error) {
          console.error('Error fetching athletes:', error);
          toast.error('Não foi possível carregar os atletas');
          return [];
        }

        // Map the data to our Athlete type with proper typing
        return (data as AthleteResponse[]).map((item) => ({
          inscricao_id: item.id,
          atleta_id: item.atleta_id,
          atleta_nome: item.usuarios?.nome_completo || 'Atleta',
          tipo_documento: item.usuarios?.tipo_documento || 'Documento',
          numero_documento: item.usuarios?.numero_documento || '',
          numero_identificador: item.usuarios?.numero_identificador || null,
          equipe_id: item.equipe_id
        }));
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
