
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
      if (!modalityId || !eventId) return [];

      try {
        console.log('Fetching athletes for modality:', modalityId, 'event:', eventId);
        
        // Check authentication first
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
        
        console.log('Session is valid, fetching athletes...');
        
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
          
          // Handle JWT errors specifically
          if (error.message?.includes('JWT') || error.message?.includes('CompactDecodeError')) {
            console.log('JWT error detected, signing out...');
            await supabase.auth.signOut();
            toast.error('Sessão expirada. Por favor, faça login novamente.');
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
      } catch (error) {
        console.error('Error in athlete query execution:', error);
        
        // Handle JWT errors in catch block too
        if (error instanceof Error && (error.message?.includes('JWT') || error.message?.includes('CompactDecodeError'))) {
          console.log('JWT error in catch block, signing out...');
          await supabase.auth.signOut();
          toast.error('Sessão expirada. Por favor, faça login novamente.');
          window.location.href = '/login';
          return [];
        }
        
        toast.error('Erro ao buscar atletas');
        return [];
      }
    },
    enabled: !!modalityId && !!eventId,
  });

  return { athletes, isLoadingAthletes };
}
