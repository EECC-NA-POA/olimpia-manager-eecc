
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ModalityRule {
  modalidade_id: number;
  regra_tipo: 'pontos' | 'distancia' | 'tempo' | 'baterias' | 'sets' | 'arrows';
  parametros: {
    unidade?: string;
    subunidade?: string;
    max_subunidade?: number;
    num_tentativas?: number;
    num_sets?: number;
    pontua_por_set?: boolean;
    num_raias?: number;
    zonas?: Array<{ nome: string; pontos: number }>;
    num_flechas?: number;
    formato_tempo?: 'mm:ss.SS' | 'hh:mm:ss';
    // New parameters for enhanced sets scoring
    melhor_de?: number;
    vencer_sets_para_seguir?: number;
    pontos_por_set?: number;
    pontos_set_final?: number;
    vantagem?: number;
    [key: string]: any;
  };
}

export function useModalityRules(modalityId: number | null) {
  return useQuery({
    queryKey: ['modality-rules', modalityId],
    queryFn: async () => {
      if (!modalityId) return null;
      
      const { data, error } = await supabase
        .from('modalidade_regras')
        .select('*')
        .eq('modalidade_id', modalityId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching modality rules:', error);
        throw error;
      }
      
      return data as ModalityRule;
    },
    enabled: !!modalityId,
  });
}
