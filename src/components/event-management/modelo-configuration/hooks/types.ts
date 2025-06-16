
export interface CampoConfig {
  id: string;
  chave_campo: string;
  rotulo_campo: string;
  tipo_input: string;
  obrigatorio: boolean;
  ordem_exibicao: number;
  metadados: any;
}

export interface ModeloConfig {
  baterias: boolean;
  num_raias: number;
  permite_final: boolean;
  regra_tipo: string;
  formato_resultado: string;
  tipo_calculo: string;
  campo_referencia: string;
  contexto: string;
  ordem_calculo: string;
}
