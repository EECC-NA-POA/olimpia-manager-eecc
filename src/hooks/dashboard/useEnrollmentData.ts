
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { EnrolledUser } from '@/components/dashboard/types/enrollmentTypes';

export const useEnrollmentData = (eventId: string | null, filialIds?: string[]) => {
  const {
    data: confirmedEnrollments,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['confirmed-enrollments', eventId, filialIds?.join(',') || 'all'],
    queryFn: async () => {
      if (!eventId) return [];

      try {
        // Check if the view exists
        const { error: viewCheckError } = await supabase
          .from('information_schema.views')
          .select('table_name')
          .eq('table_name', 'vw_inscricoes_com_confirmacao')
          .single();

        if (viewCheckError) {
          console.warn('View vw_inscricoes_com_confirmacao does not exist, using alternative data source');

          // Alternative approach: Get basic enrollment data from inscricoes_modalidades
          let query = supabase
            .from('inscricoes_modalidades')
            .select(`
              id,
              atleta_id,
              modalidade_id,
              status,
              modalidades(nome),
              usuarios!atleta_id(nome_completo, tipo_documento, numero_documento, telefone, email, filial_id, id)
            `)
            .eq('evento_id', eventId)
            .eq('status', 'confirmado');

          const { data, error } = await query;

          if (error) throw error;

          // Get all filial names to use in the transformation
          const { data: filiais } = await supabase
            .from('filiais')
            .select('id, nome');

          const filiaisMap = new Map();
          if (filiais) {
            filiais.forEach((filial: any) => {
              filiaisMap.set(filial.id, filial.nome);
            });
          }

          // Filter out records where usuarios is null
          let validData = (data || []).filter(item => item.usuarios !== null);

          // Apply filialIds filter on the client side (since we can't filter by nested field with .in())
          if (filialIds && filialIds.length > 0) {
            validData = validData.filter(item => {
              const user = item.usuarios as any;
              return user?.filial_id && filialIds.includes(user.filial_id);
            });
          }

          // Transform to match EnrolledUser interface
          const transformedData: EnrolledUser[] = validData.map((item: any) => ({
            id: item.id,
            atleta_id: item.atleta_id,
            nome_atleta: item.usuarios?.nome_completo || 'Unknown',
            tipo_documento: item.usuarios?.tipo_documento || 'Unknown',
            numero_documento: item.usuarios?.numero_documento || 'Unknown',
            telefone: item.usuarios?.telefone || 'Unknown',
            email: item.usuarios?.email || 'Unknown',
            modalidade_id: item.modalidade_id,
            modalidade_nome: item.modalidades?.nome || 'Unknown',
            status_inscricao: item.status,
            filial_id: item.usuarios?.filial_id || '',
            filial: filiaisMap.get(item.usuarios?.filial_id) || 'Unknown',
            evento_id: eventId
          }));

          console.log(`Found ${transformedData.length} confirmed enrollments after filtering`);
          return transformedData;
        }

        // If view exists, use the original query
        let query = supabase
          .from('vw_inscricoes_com_confirmacao')
          .select('*')
          .eq('evento_id', eventId)
          .eq('status_inscricao', 'confirmado');

        // For delegation representatives, filter by multiple branches
        if (filialIds && filialIds.length > 0) {
          query = query.in('filial_id', filialIds);
        }

        const { data, error } = await query;

        if (error) throw error;
        console.log(`Found ${data?.length || 0} enrollments using view`);
        return data as EnrolledUser[];
      } catch (error) {
        console.error('Error fetching enrollments:', error);
        return []; // Return empty array to prevent UI breakage
      }
    },
    enabled: !!eventId,
    retry: 1,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    meta: {
      onError: (error: any) => {
        console.error('Error fetching enrollments:', error);
      }
    }
  });

  return {
    confirmedEnrollments,
    isLoading,
    error,
    refetch
  };
};
