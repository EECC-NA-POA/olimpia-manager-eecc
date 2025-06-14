
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
      if (!modalityId || !eventId) return [];

      try {
        console.log('Fetching athletes for modality:', modalityId, 'event:', eventId);
        
        // First, get the enrollments
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('inscricoes_modalidades')
          .select('id, atleta_id')
          .eq('modalidade_id', modalityId)
          .eq('evento_id', eventId)
          .eq('status', 'confirmado');

        if (enrollmentsError) {
          console.error('Error fetching enrollments:', enrollmentsError);
          toast.error('Não foi possível carregar as inscrições');
          return [];
        }

        console.log('Raw enrollment data:', enrollments);

        if (!enrollments || enrollments.length === 0) {
          console.log('No enrollments found for this modality');
          return [];
        }

        // Get athlete IDs from enrollments
        const athleteIds = enrollments.map(e => e.atleta_id);
        console.log('Athlete IDs from enrollments:', athleteIds);

        // Now get user data for these athletes
        const { data: users, error: usersError } = await supabase
          .from('usuarios')
          .select('id, nome_completo, tipo_documento, numero_documento, filial_id')
          .in('id', athleteIds);

        if (usersError) {
          console.error('Error fetching users:', usersError);
          toast.error('Não foi possível carregar os dados dos atletas');
          return [];
        }

        console.log('Users data:', users);

        // Get unique filial IDs from users
        const filialIds = [...new Set(
          users
            .map(user => user.filial_id)
            .filter(id => id !== null && id !== undefined)
        )] as number[];

        console.log('Filial IDs to fetch:', filialIds);

        // Fetch filial data if there are filiais
        let filiaisData: any[] = [];
        if (filialIds.length > 0) {
          const { data: filiais, error: filiaisError } = await supabase
            .from('filiais')
            .select('id, nome')
            .in('id', filialIds);

          if (filiaisError) {
            console.error('Error fetching filiais:', filiaisError);
          } else {
            filiaisData = filiais || [];
          }
        }

        console.log('Filiais data:', filiaisData);

        // Transform the data to match our Athlete interface
        const athletes = enrollments.map((enrollment) => {
          const user = users.find(u => u.id === enrollment.atleta_id);
          const filial = filiaisData.find(f => f.id === user?.filial_id);
          
          if (!user) {
            console.warn('User not found for athlete ID:', enrollment.atleta_id);
            return null;
          }
          
          return {
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
        }).filter(Boolean); // Remove null entries

        console.log('Final processed athletes:', athletes);
        return athletes;
      } catch (error) {
        console.error('Error in athlete query execution:', error);
        toast.error('Erro ao buscar atletas');
        return [];
      }
    },
    enabled: !!modalityId && !!eventId,
  });

  return { data: athletes, isLoading: isLoadingAthletes };
}
