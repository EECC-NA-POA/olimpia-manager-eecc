
export interface Event {
  id: string;
  nome: string;
  descricao: string | null;
  data_inicio_inscricao: string;
  data_fim_inscricao: string;
  data_inicio_evento: string | null;
  data_fim_evento: string | null;
  pais: string | null;
  estado: string | null;
  cidade: string | null;
  foto_evento: string | null;
  tipo: 'estadual' | 'nacional' | 'internacional' | 'regional';
  data_inicio: string | null;
  data_fim: string | null;
  created_at: string | null;
  updated_at: string | null;
  status_evento: 'ativo' | 'encerrado' | 'suspenso' | 'em_teste';
  visibilidade_publica: boolean;
}

export interface EventBranch {
  evento_id: string;
  filial_id: string;
}

export interface EventRegulation {
  id: string;
  evento_id: string;
  versao: string;
  titulo: string;
  regulamento_texto: string;
  regulamento_link: string | null;
  is_ativo: boolean;
  exibir_texto_publico?: boolean;
  criado_por: string;
  criado_em: string;
  atualizado_por: string | null;
  atualizado_em: string | null;
}

export interface ProfileType {
  id: string;
  codigo: string;
  descricao: string | null;
}

export interface Profile {
  id: number;
  nome: string;
  descricao: string | null;
  evento_id: string;
  perfil_tipo_id: string;
}

export interface UserRole {
  id: number;
  usuario_id: string;
  perfil_id: number;
  evento_id: string;
}

export type PerfilTipo = 'ATL' | 'PGR';

export interface ScoreRecord {
  id: number;
  evento_id: string;
  modalidade_id: number;
  atleta_id: string;
  equipe_id?: number | null;
  juiz_id: string;
  valor_pontuacao?: number | null;
  tempo_minutos?: number | null;
  tempo_segundos?: number | null;
  tempo_milissegundos?: number | null;
  posicao_final?: number | null;
  observacoes?: string | null;
  data_registro: string;
  unidade: string;
  bateria_id?: number | null;
  criterio_id?: number | null;
}

export interface Modality {
  modalidade_id: number;
  modalidade_nome: string;
  categoria: string;
  tipo_modalidade: string;
  tipo_pontuacao: 'tempo' | 'distancia' | 'pontos';
}
