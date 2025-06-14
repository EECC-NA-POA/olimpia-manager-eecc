
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Athlete {
  inscricao_id: number;
  atleta_id: string;
  atleta_nome: string;
  tipo_documento: string;
  numero_documento: string;
  numero_identificador?: string;
  filial_id?: number | null;
  filial_nome?: string | null;
  equipe_id?: number | null;
  equipe_nome?: string | null;
  origem_uf?: string | null;
  origem_cidade?: string | null;
}

export function useAthletes(modalityId: number | null, eventId: string | null) {
  const { data: athletes, isLoading: isLoadingAthletes } = useQuery({
    queryKey: ['athletes', modalityId, eventId],
    queryFn: async () => {
      if (!modalityId || !eventId) {
        console.log('useAthletes: Missing parameters', { modalityId, eventId });
        return [];
      }

      try {
        console.log('=== ATHLETES QUERY START ===');
        console.log('Fetching athletes for modality:', modalityId, 'event:', eventId);
        
        // Use a more direct approach with a single query joining the tables
        const { data: athletesData, error } = await supabase
          .from('inscricoes_modalidades')
          .select(`
            id,
            atleta_id,
            status,
            usuarios!inner (
              id,
              nome_completo,
              tipo_documento,
              numero_documento,
              filial_id,
              filiais (
                id,
                nome
              )
            )
          `)
          .eq('modalidade_id', modalityId)
          .eq('evento_id', eventId)
          .eq('status', 'confirmado');

        console.log('Direct query result:', athletesData);
        console.log('Query error:', error);

        if (error) {
          console.error('Error fetching athletes:', error);
          toast.error('Não foi possível carregar os atletas');
          return [];
        }

        if (!athletesData || athletesData.length === 0) {
          console.log('No athletes found with direct query');
          return [];
        }

        // Transform the data to match our Athlete interface
        const athletes = athletesData.map((enrollment: any) => {
          // Access the user object directly since it's joined with !inner
          const user = enrollment.usuarios;
          // Access filiais - it could be an object or null
          const filial = user?.filiais;
          
          if (!user) {
            console.warn('User not found for enrollment:', enrollment.id);
            return null;
          }
          
          const athlete: Athlete = {
            inscricao_id: enrollment.id,
            atleta_id: enrollment.atleta_id,
            atleta_nome: user.nome_completo || 'Atleta',
            tipo_documento: user.tipo_documento || 'Documento',
            numero_documento: user.numero_documento || '',
            filial_id: user.filial_id,
            filial_nome: filial?.nome || null,
            equipe_id: null,
            equipe_nome: filial?.nome || null,
            origem_uf: null,
            origem_cidade: filial?.nome || null,
          };

          console.log('Processed athlete:', athlete);
          return athlete;
        }).filter(Boolean) as Athlete[];

        console.log('=== FINAL ATHLETES RESULT ===');
        console.log('Total athletes processed:', athletes.length);
        console.log('Athletes:', athletes);
        console.log('=== END ATHLETES QUERY ===');
        
        return athletes;
      } catch (error) {
        console.error('Error in athlete query execution:', error);
        toast.error('Erro ao buscar atletas');
        return [];
      }
    },
    enabled: !!modalityId && !!eventId,
    retry: 1,
    staleTime: 30000, // 30 seconds
  });

  console.log('useAthletes hook result:', { 
    athletes: athletes?.length || 0, 
    isLoading: isLoadingAthletes,
    modalityId,
    eventId 
  });

  return { data: athletes, isLoading: isLoadingAthletes };
}
