
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ModeloConfiguration {
  modalidade_id: number;
  modelo_id: number;
  parametros: {
    baterias?: boolean;
    num_raias?: number;
    permite_final?: boolean;
    regra_tipo?: string;
    unidade?: string;
    subunidade?: string;
    [key: string]: any;
  };
}

// Legacy type for backward compatibility
export interface ModalityRule {
  regra_tipo: string;
  parametros: {
    baterias?: boolean;
    num_raias?: number;
    permite_final?: boolean;
    unidade?: string;
    subunidade?: string;
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

// Legacy function for backward compatibility
export function useModalityRules(modalidadeId: number | null) {
  const { data: config, ...rest } = useModeloConfiguration(modalidadeId);
  
  const legacyRule: ModalityRule | null = config ? {
    regra_tipo: config.parametros.regra_tipo || 'pontos',
    parametros: config.parametros
  } : null;
  
  return {
    data: legacyRule,
    ...rest
  };
}
