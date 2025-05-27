
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

export type RegrasTipo = 'tempo' | 'distancia' | 'pontos' | 'sets' | 'arrows';

export interface ModalityRule {
  id?: number;
  modalidade_id: string;
  regra_tipo: RegrasTipo;
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
    // Enhanced sets scoring parameters
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
  criado_em?: string;
  atualizado_em?: string | null;
}

export interface RuleForm {
  regra_tipo: RegrasTipo;
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
    // Enhanced sets scoring parameters
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
  };
}
