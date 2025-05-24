
export interface TeamData {
  id: number;
  nome: string;
  modalidade_id: number;
  filial_id: string;
  evento_id: string;
  modalidade_info?: {
    nome: string;
    categoria: string;
  };
  atletas: TeamAthlete[];
}

export interface TeamAthlete {
  id: number;
  atleta_id: string;
  nome: string;
  posicao: number;
  raia?: number;
  documento: string;
}

export interface ModalityOption {
  id: number;
  nome: string;
  categoria: string;
}

export interface AthleteOption {
  id: string;
  nome: string;
  documento: string;
}

export interface AvailableAthlete {
  atleta_id: string;
  name?: string;
  atleta_nome: string;
  documento_tipo?: string;
  documento_numero?: string;
  identificador?: string;
  tipo_documento: string;
  numero_documento: string;
  numero_identificador?: string | null;
}

export interface Team {
  id: number;
  nome: string;
  modalidade_id: number;
  filial_id: string;
  evento_id: string;
  observacoes?: string;
  modalidades?: {
    nome: string;
    categoria: string;
  };
  athletes?: SimpleTeamAthlete[];
}

export interface SimpleTeamAthlete {
  id: number;
  atleta_id: string;
  atleta_nome: string;
  posicao: number;
  raia?: number;
  tipo_documento: string;
  numero_documento: string;
}
