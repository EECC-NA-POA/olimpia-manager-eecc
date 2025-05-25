
export interface Modality {
  id: string;
  nome: string;
  regra?: ModalityRule;
}

export interface ModalityRule {
  id?: string;
  modalidade_id: string;
  regra_tipo: 'pontos' | 'distancia' | 'tempo' | 'baterias' | 'sets' | 'arrows';
  parametros: {
    unidade?: string;
    num_tentativas?: number;
    num_sets?: number;
    pontua_por_set?: boolean;
    num_raias?: number;
    zonas?: Array<{ nome: string; pontos: number }>;
    num_flechas?: number;
    formato_tempo?: 'mm:ss.SS' | 'hh:mm:ss';
    [key: string]: any;
  };
}

export interface RuleForm {
  regra_tipo: 'pontos' | 'distancia' | 'tempo' | 'baterias' | 'sets' | 'arrows';
  parametros: {
    unidade?: string;
    num_tentativas?: number;
    num_sets?: number;
    pontua_por_set?: boolean;
    num_raias?: number;
    zonas?: Array<{ nome: string; pontos: number }>;
    num_flechas?: number;
    formato_tempo?: 'mm:ss.SS' | 'hh:mm:ss';
  };
}
