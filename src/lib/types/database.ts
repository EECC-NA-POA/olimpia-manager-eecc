
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
  local: string | null;
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
