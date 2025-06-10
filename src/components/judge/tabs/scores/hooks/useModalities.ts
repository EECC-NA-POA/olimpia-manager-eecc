
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Modality } from '@/lib/types/database';

export function useModalities(eventId: string | null) {
  const queryResult = useQuery({
    queryKey: ['judge-modalities', eventId],
    queryFn: async () => {
      if (!eventId) return [];

      // Fetch modalities with their rules
      const { data: modalitiesData, error: modalitiesError } = await supabase
        .from('modalidades')
        .select('id, nome, categoria, tipo_modalidade, tipo_pontuacao')
        .eq('evento_id', eventId)
        .order('nome');

      if (modalitiesError) {
        console.error('Error fetching modalities:', modalitiesError);
        throw modalitiesError;
      }

      // Fetch modality rules
      const modalityIds = modalitiesData?.map(m => m.id) || [];
      const { data: rulesData, error: rulesError } = await supabase
        .from('modalidade_regras')
        .select('*')
        .in('modalidade_id', modalityIds);

      if (rulesError) {
        console.error('Error fetching modality rules:', rulesError);
        // Don't throw error here, just log it and continue without rules
      }

      console.log('Fetched modalities with scoring types:', modalitiesData);
      console.log('Fetched modality rules:', rulesData);
      
      // Transform the data to match the Modality interface and include rules
      return modalitiesData.map(item => {
        const rule = rulesData?.find(r => r.modalidade_id === item.id);
        return {
          modalidade_id: item.id,
          modalidade_nome: item.nome,
          categoria: item.categoria,
          tipo_modalidade: item.tipo_modalidade,
          tipo_pontuacao: item.tipo_pontuacao,
          regra: rule || null
        };
      }) as (Modality & { regra: any })[];
    },
    enabled: !!eventId,
  });

  return {
    modalities: queryResult.data || [],
    isLoadingModalities: queryResult.isLoading,
    error: queryResult.error
  };
}
