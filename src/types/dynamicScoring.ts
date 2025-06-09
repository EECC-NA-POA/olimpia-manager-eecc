
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
  tipo_input: 'number' | 'integer' | 'text' | 'select';
  obrigatorio: boolean;
  ordem_exibicao: number;
  metadados: {
    min?: number;
    max?: number;
    step?: number;
    opcoes?: string[];
  } | null;
}

export interface TentativaPontuacao {
  id: number;
  pontuacao_id: number;
  chave_campo: string;
  valor: number;
  criado_em: string;
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
