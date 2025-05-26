
export interface Modality {
  id: string;
  nome: string;
  tipo_pontuacao: 'tempo' | 'distancia' | 'pontos';
  tipo_modalidade: 'individual' | 'coletivo';
  categoria: 'misto' | 'masculino' | 'feminino';
  status: 'Ativa' | 'Em análise' | 'Esgotada' | 'Cancelada';
  limite_vagas: number;
  vagas_ocupadas: number;
  grupo: string | null;
  evento_id: string;
  faixa_etaria: 'adulto' | 'infantil';
  regra?: ModalityRule;
}

export interface ModalityRule {
  id?: number;
  modalidade_id: string;
  regra_tipo: 'pontos' | 'distancia' | 'tempo' | 'baterias' | 'sets' | 'arrows';
  parametros: {
    // Common parameters
    unidade?: string;
    subunidade?: string;
    max_subunidade?: number;
    
    // Distance parameters
    formato_exibicao?: 'decimal' | 'separado';
    precisao?: number;
    
    // Time parameters
    formato_tempo?: 'mm:ss.SS' | 'hh:mm:ss' | 'ss.SSS';
    precisao_ms?: string;
    
    // Baterias parameters
    num_tentativas?: number;
    num_raias?: number;
    melhor_resultado?: boolean;
    
    // Sets parameters
    num_sets?: number;
    pontua_por_set?: boolean;
    melhor_de?: number;
    vencer_sets_para_seguir?: number;
    pontos_por_set?: number;
    pontos_set_final?: number;
    vantagem?: number;
    
    // Arrows parameters
    num_flechas?: number;
    num_ends?: number;
    pontuacao_maxima?: number;
    
    // Points parameters
    pontuacao_minima?: number;
    incremento?: number;
    
    // Legacy zones parameter
    zonas?: Array<{ nome: string; pontos: number }>;
    
    [key: string]: any;
  };
  criado_em?: string;
  atualizado_em?: string | null;
}

export interface RuleForm {
  regra_tipo: 'pontos' | 'distancia' | 'tempo' | 'baterias' | 'sets' | 'arrows';
  parametros: {
    // Common parameters
    unidade?: string;
    subunidade?: string;
    max_subunidade?: number;
    
    // Distance parameters
    formato_exibicao?: 'decimal' | 'separado';
    precisao?: number;
    
    // Time parameters
    formato_tempo?: 'mm:ss.SS' | 'hh:mm:ss' | 'ss.SSS';
    precisao_ms?: string;
    
    // Baterias parameters
    num_tentativas?: number;
    num_raias?: number;
    melhor_resultado?: boolean;
    
    // Sets parameters
    num_sets?: number;
    pontua_por_set?: boolean;
    melhor_de?: number;
    vencer_sets_para_seguir?: number;
    pontos_por_set?: number;
    pontos_set_final?: number;
    vantagem?: number;
    
    // Arrows parameters
    num_flechas?: number;
    num_ends?: number;
    pontuacao_maxima?: number;
    
    // Points parameters
    pontuacao_minima?: number;
    incremento?: number;
    
    // Legacy zones parameter
    zonas?: Array<{ nome: string; pontos: number }>;
  };
}
