
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
        
        // First, let's check what modality this is
        const { data: modalityInfo } = await supabase
          .from('modalidades')
          .select('id, nome, categoria, tipo_pontuacao')
          .eq('id', modalityId)
          .single();
        
        console.log('Modality info:', modalityInfo);
        
        // Let's also check if there are any enrollments at all for this modality
        const { data: enrollmentCheck } = await supabase
          .from('inscricoes_modalidades')
          .select('id, atleta_id, status')
          .eq('modalidade_id', modalityId)
          .eq('evento_id', eventId);
        
        console.log('Raw enrollments found:', enrollmentCheck?.length || 0);
        console.log('Enrollments data:', enrollmentCheck);
        
        // Check confirmed enrollments specifically
        const { data: confirmedCheck } = await supabase
          .from('inscricoes_modalidades')
          .select('id, atleta_id, status')
          .eq('modalidade_id', modalityId)
          .eq('evento_id', eventId)
          .eq('status', 'confirmado');
        
        console.log('Confirmed enrollments found:', confirmedCheck?.length || 0);
        console.log('Confirmed enrollments:', confirmedCheck);
        
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
        console.log('Direct query error:', error);
        console.log('Athletes data length:', athletesData?.length || 0);

        if (error) {
          console.error('Error fetching athletes:', error);
          toast.error('Não foi possível carregar os atletas');
          return [];
        }

        if (!athletesData || athletesData.length === 0) {
          console.log('No athletes found with direct query for modality:', modalityInfo?.nome);
          
          // Let's check if there are users with these athlete IDs
          if (confirmedCheck && confirmedCheck.length > 0) {
            console.log('Checking if users exist for athlete IDs...');
            const athleteIds = confirmedCheck.map(e => e.atleta_id);
            const { data: usersCheck } = await supabase
              .from('usuarios')
              .select('id, nome_completo')
              .in('id', athleteIds);
            
            console.log('Users found for athlete IDs:', usersCheck?.length || 0);
            console.log('Users data:', usersCheck);
          }
          
          return [];
        }

        // Transform the data to match our Athlete interface
        const athletes = athletesData.map((enrollment: any) => {
          console.log('Processing enrollment:', enrollment);
          
          // Access the user object directly since it's joined with !inner
          const user = enrollment.usuarios;
          
          if (!user) {
            console.warn('User not found for enrollment:', enrollment.id);
            return null;
          }
          
          console.log('User data:', user);
          
          // Access filiais - it should be an object, not an array
          const filial = user.filiais;
          console.log('Filial data:', filial);
          
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
        console.log('Modality name:', modalityInfo?.nome);
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
