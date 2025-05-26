
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
    [key: string]: any;
  };
  criado_em?: string;
  atualizado_em?: string | null;
}

export interface RuleForm {
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
    // Enhanced sets scoring parameters
    melhor_de?: number;
    vencer_sets_para_seguir?: number;
    pontos_por_set?: number;
    pontos_set_final?: number;
    vantagem?: number;
  };
}
