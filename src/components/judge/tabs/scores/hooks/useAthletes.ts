
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
        console.log('=== COMPLETE ATHLETES QUERY DEBUG START ===');
        console.log('Parameters:', { modalityId, eventId });
        
        // Step 1: Check if modality exists
        console.log('Step 1: Checking modality existence...');
        const { data: modalityCheck, error: modalityError } = await supabase
          .from('modalidades')
          .select('id, nome, categoria, tipo_pontuacao')
          .eq('id', modalityId)
          .single();
        
        console.log('Modality check result:', { modalityCheck, modalityError });
        
        if (modalityError || !modalityCheck) {
          console.error('Modality not found or error:', modalityError);
          return [];
        }

        // Step 2: Get all enrollments for this modality and event
        console.log('Step 2: Fetching all enrollments...');
        const { data: allEnrollments, error: allEnrollmentsError } = await supabase
          .from('inscricoes_modalidades')
          .select('*')
          .eq('modalidade_id', modalityId)
          .eq('evento_id', eventId);
        
        console.log('All enrollments:', { 
          count: allEnrollments?.length || 0, 
          data: allEnrollments,
          error: allEnrollmentsError 
        });

        // Step 3: Filter confirmed enrollments
        const confirmedEnrollments = allEnrollments?.filter(e => e.status === 'confirmado') || [];
        console.log('Confirmed enrollments:', {
          count: confirmedEnrollments.length,
          data: confirmedEnrollments
        });

        if (confirmedEnrollments.length === 0) {
          console.log('No confirmed enrollments found');
          return [];
        }

        // Step 4: Get athlete IDs
        const athleteIds = confirmedEnrollments.map(e => e.atleta_id);
        console.log('Athlete IDs to fetch:', athleteIds);

        // Step 5: Fetch user data for these athletes
        console.log('Step 5: Fetching user data...');
        const { data: usersData, error: usersError } = await supabase
          .from('usuarios')
          .select(`
            id,
            nome_completo,
            tipo_documento,
            numero_documento,
            filial_id
          `)
          .in('id', athleteIds);

        console.log('Users data result:', {
          count: usersData?.length || 0,
          data: usersData,
          error: usersError
        });

        if (usersError) {
          console.error('Error fetching users:', usersError);
          toast.error('Erro ao buscar dados dos atletas');
          return [];
        }

        if (!usersData || usersData.length === 0) {
          console.log('No users found for athlete IDs');
          return [];
        }

        // Step 6: Fetch filiais data separately
        console.log('Step 6: Fetching filiais data...');
        const filialIds = usersData.map(u => u.filial_id).filter(Boolean);
        console.log('Filial IDs to fetch:', filialIds);

        let filiaisData = [];
        if (filialIds.length > 0) {
          const { data: filiaisResult, error: filiaisError } = await supabase
            .from('filiais')
            .select('id, nome, estado')
            .in('id', filialIds);

          console.log('Filiais data result:', {
            count: filiaisResult?.length || 0,
            data: filiaisResult,
            error: filiaisError
          });

          filiaisData = filiaisResult || [];
        }

        // Step 7: Build athletes array
        console.log('Step 7: Building athletes array...');
        const athletes = usersData.map((user: any) => {
          console.log('Processing user:', user);
          
          // Find the corresponding enrollment
          const enrollment = confirmedEnrollments.find(e => e.atleta_id === user.id);
          if (!enrollment) {
            console.warn('No enrollment found for user:', user.id);
            return null;
          }

          // Find filial data
          const filial = filiaisData.find(f => f.id === user.filial_id);
          console.log('Filial for user:', { userId: user.id, filialId: user.filial_id, filial });
          
          const athlete: Athlete = {
            inscricao_id: enrollment.id,
            atleta_id: user.id,
            atleta_nome: user.nome_completo || 'Nome não informado',
            tipo_documento: user.tipo_documento || 'CPF',
            numero_documento: user.numero_documento || '',
            filial_id: user.filial_id,
            filial_nome: filial?.nome || null,
            equipe_id: null,
            equipe_nome: filial?.nome || null,
            origem_uf: filial?.estado || null,
            origem_cidade: filial?.nome || null,
          };

          console.log('Built athlete:', athlete);
          return athlete;
        }).filter(Boolean) as Athlete[];

        console.log('=== FINAL RESULT ===');
        console.log('Total athletes built:', athletes.length);
        console.log('Athletes array:', athletes);
        console.log('=== COMPLETE ATHLETES QUERY DEBUG END ===');
        
        return athletes;
      } catch (error) {
        console.error('=== ATHLETES QUERY ERROR ===');
        console.error('Complete error object:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        toast.error('Erro ao buscar atletas: ' + error.message);
        return [];
      }
    },
    enabled: !!modalityId && !!eventId,
    retry: 1,
    staleTime: 30000, // 30 seconds
  });

  console.log('=== useAthletes HOOK FINAL RESULT ===');
  console.log('Hook result:', { 
    athletesCount: athletes?.length || 0, 
    isLoading: isLoadingAthletes,
    modalityId,
    eventId,
    athletes
  });

  return { data: athletes, isLoading: isLoadingAthletes };
}
