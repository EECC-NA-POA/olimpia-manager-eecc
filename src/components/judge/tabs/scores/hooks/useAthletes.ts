
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

        if (!confirmedCheck || confirmedCheck.length === 0) {
          console.log('No confirmed enrollments found for this modality');
          return [];
        }

        // Get athlete IDs from confirmed enrollments
        const athleteIds = confirmedCheck.map(enrollment => enrollment.atleta_id);
        console.log('Athlete IDs to fetch:', athleteIds);

        // Fetch user data for these athletes
        const { data: usersData, error: usersError } = await supabase
          .from('usuarios')
          .select(`
            id,
            nome_completo,
            tipo_documento,
            numero_documento,
            filial_id,
            filiais (
              id,
              nome
            )
          `)
          .in('id', athleteIds);

        console.log('Users data fetched:', usersData?.length || 0);
        console.log('Users data:', usersData);
        console.log('Users error:', usersError);

        if (usersError) {
          console.error('Error fetching users:', usersError);
          toast.error('Erro ao buscar dados dos atletas');
          return [];
        }

        if (!usersData || usersData.length === 0) {
          console.log('No users found for athlete IDs');
          return [];
        }

        // Transform the data to match our Athlete interface
        const athletes = usersData.map((user: any) => {
          console.log('Processing user:', user);
          
          // Find the corresponding enrollment
          const enrollment = confirmedCheck.find(e => e.atleta_id === user.id);
          if (!enrollment) {
            console.warn('No enrollment found for user:', user.id);
            return null;
          }

          console.log('User data:', user);
          console.log('Enrollment data:', enrollment);
          
          // Access filiais - handle both array and object cases
          let filialNome = null;
          if (user.filiais) {
            if (Array.isArray(user.filiais)) {
              filialNome = user.filiais[0]?.nome || null;
            } else {
              filialNome = user.filiais.nome || null;
            }
          }
          
          console.log('Filial nome:', filialNome);
          
          const athlete: Athlete = {
            inscricao_id: enrollment.id,
            atleta_id: user.id,
            atleta_nome: user.nome_completo || 'Atleta',
            tipo_documento: user.tipo_documento || 'Documento',
            numero_documento: user.numero_documento || '',
            filial_id: user.filial_id,
            filial_nome: filialNome,
            equipe_id: null,
            equipe_nome: filialNome,
            origem_uf: null,
            origem_cidade: filialNome,
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
