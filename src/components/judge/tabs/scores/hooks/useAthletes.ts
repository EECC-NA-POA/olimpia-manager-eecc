
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UserInfo {
  nome_completo?: string;
  tipo_documento?: string;
  numero_documento?: string;
  numero_identificador?: string | null;
}

interface Athlete {
  inscricao_id: number;
  atleta_id: string;
  atleta_nome: string;
  tipo_documento: string;
  numero_documento: string;
  numero_identificador?: string | null;
  equipe_id?: number | null;
}

export function useAthletes(modalityId: number | null, eventId: string | null) {
  const { data: athletes, isLoading: isLoadingAthletes } = useQuery({
    queryKey: ['athletes', modalityId, eventId],
    queryFn: async () => {
      if (!modalityId || !eventId) return [];

      const { data, error } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          id,
          atleta_id,
          usuarios:atleta_id (
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

      return data.map((item) => {
        // Handle the usuarios data, ensuring it's treated as an object and not an array
        const userData = item.usuarios as UserInfo | null;
        
        return {
          inscricao_id: item.id,
          atleta_id: item.atleta_id,
          atleta_nome: userData?.nome_completo || 'Atleta',
          tipo_documento: userData?.tipo_documento || 'Documento',
          numero_documento: userData?.numero_documento || '',
          numero_identificador: userData?.numero_identificador,
          equipe_id: item.equipe_id
        };
      }) as Athlete[];
    },
    enabled: !!modalityId && !!eventId,
  });

  return { athletes, isLoadingAthletes };
}

export type { Athlete };
