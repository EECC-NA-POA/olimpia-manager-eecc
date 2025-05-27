
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ModalityRule {
  modalidade_id: number;
  regra_tipo: 'pontos' | 'distancia' | 'tempo' | 'sets' | 'arrows';
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
    // Distance modality heat and lane parameters
    baterias?: boolean;
    raias_por_bateria?: number;
    num_baterias?: number;
    // Archery-specific parameters
    fase_classificacao?: boolean;
    num_flechas_classificacao?: number;
    fase_eliminacao?: boolean;
    sets_por_combate?: number;
    flechas_por_set?: number;
    pontos_vitoria_set?: number;
    pontos_empate_set?: number;
    pontos_para_vencer?: number;
    shoot_off?: boolean;
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
