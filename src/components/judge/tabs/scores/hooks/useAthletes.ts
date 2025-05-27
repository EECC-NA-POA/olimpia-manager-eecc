
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Athlete {
  inscricao_id: number;
  atleta_id: string;
  atleta_nome: string;
  tipo_documento: string;
  numero_documento: string;
}

// Interface to type the response from Supabase
interface AthleteResponse {
  id: number;
  atleta_id: string;
  usuarios: {
    nome_completo: string;
    tipo_documento: string;
    numero_documento: string;
  } | null;
}

export function useAthletes(modalityId: number | null, eventId: string | null) {
  const { data: athletes, isLoading: isLoadingAthletes } = useQuery({
    queryKey: ['athletes', modalityId, eventId],
    queryFn: async () => {
      if (!modalityId || !eventId) {
        console.log('Missing required params - modalityId:', modalityId, 'eventId:', eventId);
        return [];
      }

      try {
        console.log('Fetching athletes for modality:', modalityId, 'event:', eventId);
        
        // Check if we have a valid session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          toast.error('Erro de autenticação. Faça login novamente.');
          return [];
        }
        
        if (!session) {
          console.error('No active session found');
          toast.error('Sessão expirada. Faça login novamente.');
          return [];
        }

        console.log('Session is valid, proceeding with query');
        
        const { data, error } = await supabase
          .from('inscricoes_modalidades')
          .select(`
            id,
            atleta_id,
            usuarios!inner(
              nome_completo,
              tipo_documento,
              numero_documento
            )
          `)
          .eq('modalidade_id', modalityId)
          .eq('evento_id', eventId)
          .eq('status', 'confirmado');

        if (error) {
          console.error('Error fetching athletes:', error);
          
          // Handle specific JWT errors
          if (error.message?.includes('JWT') || error.message?.includes('CompactDecodeError')) {
            toast.error('Erro de autenticação. Faça login novamente.');
            // Sign out and redirect
            await supabase.auth.signOut();
            window.location.href = '/login';
            return [];
          }
          
          toast.error('Não foi possível carregar os atletas');
          return [];
        }

        console.log('Raw athlete data:', data);

        if (!data || data.length === 0) {
          console.log('No athletes found for this modality');
          return [];
        }

        // Transform the data to match our Athlete interface
        const transformedData = data.map((item) => ({
          inscricao_id: item.id,
          atleta_id: item.atleta_id,
          atleta_nome: item.usuarios?.nome_completo || 'Atleta',
          tipo_documento: item.usuarios?.tipo_documento || 'Documento',
          numero_documento: item.usuarios?.numero_documento || '',
        }));

        console.log('Transformed athlete data:', transformedData);
        return transformedData;
      } catch (error: any) {
        console.error('Error in athlete query execution:', error);
        
        // Handle authentication errors
        if (error.message?.includes('JWT') || error.message?.includes('CompactDecodeError')) {
          toast.error('Erro de autenticação. Faça login novamente.');
          await supabase.auth.signOut();
          window.location.href = '/login';
          return [];
        }
        
        toast.error('Erro ao buscar atletas');
        return [];
      }
    },
    enabled: !!modalityId && !!eventId,
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('JWT') || error?.message?.includes('CompactDecodeError')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return { athletes, isLoadingAthletes };
}
