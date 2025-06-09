
export interface ModeloModalidade {
  id: number;
  modalidade_id: number;
  codigo_modelo: string;
  descricao: string | null;
  criado_em: string;
  atualizado_em: string | null;
}

export interface CampoModelo {
  id: number;
  modelo_id: number;
  chave_campo: string;
  rotulo_campo: string;
  tipo_input: 'number' | 'integer' | 'text' | 'select' | 'calculated';
  obrigatorio: boolean;
  ordem_exibicao: number;
  metadados: {
    min?: number;
    max?: number;
    step?: number;
    opcoes?: string[];
    // Metadados para campos calculados
    tipo_calculo?: 'colocacao_bateria' | 'colocacao_final' | 'custom';
    campo_referencia?: string;
    contexto?: 'bateria' | 'modalidade' | 'evento';
    formula?: string;
    ordem_calculo?: 'asc' | 'desc';
    // Novos metadados para máscaras de resultado
    formato_resultado?: 'tempo' | 'distancia' | 'pontos';
    mascara?: string;
    unidade_display?: string;
  } | null;
}

export interface TentativaPontuacao {
  id: number;
  pontuacao_id: number;
  chave_campo: string;
  valor: number;
  criado_em: string;
  calculado?: boolean;
}

export interface SetPartida {
  id: number;
  pontuacao_id: number;
  numero_set: number;
  pontos_atleta1: number | null;
  pontos_atleta2: number | null;
  vencedor: string | null;
}

export interface DynamicFormData {
  [key: string]: any;
}

export interface CalculationResult {
  chave_campo: string;
  atleta_id: string;
  valor_calculado: number;
  metodo_calculo: string;
}

export interface CalculationContext {
  tipo: 'bateria' | 'modalidade' | 'evento';
  bateria_id?: number;
  modalidade_id: number;
  evento_id: string;
}
