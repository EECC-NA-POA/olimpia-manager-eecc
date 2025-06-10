
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ModeloConfiguration {
  modalidade_id: number;
  modelo_id: number;
  parametros: {
    baterias?: boolean;
    num_raias?: number;
    permite_final?: boolean;
    [key: string]: any;
  };
}

export function useModeloConfiguration(modalidadeId: number | null) {
  return useQuery({
    queryKey: ['modelo-configuration', modalidadeId],
    queryFn: async () => {
      if (!modalidadeId) return null;
      
      const { data, error } = await supabase
        .from('modelos_modalidade')
        .select('id, modalidade_id, parametros')
        .eq('modalidade_id', modalidadeId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching modelo configuration:', error);
        throw error;
      }
      
      if (!data) return null;
      
      return {
        modalidade_id: data.modalidade_id,
        modelo_id: data.id,
        parametros: data.parametros || {}
      } as ModeloConfiguration;
    },
    enabled: !!modalidadeId,
  });
}
