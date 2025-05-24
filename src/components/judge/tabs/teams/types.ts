
export interface ModalityOption {
  id: number;
  nome: string;
  categoria: string;
  tipo_modalidade: 'individual' | 'coletiva';
}

export interface AthleteOption {
  id: string;
  nome: string;
  documento: string;
}

export interface TeamAthlete {
  id: number;
  atleta_id: string;
  atleta_nome: string;
  posicao: number;
  raia?: number;
  documento: string;
  filial_nome?: string;
}

export interface TeamData {
  id: number;
  nome: string;
  modalidade_id: number;
  filial_id: string;
  evento_id: string;
  modalidade_info?: ModalityOption;
  atletas: TeamAthlete[];
}

// Re-export types for compatibility
export interface Team {
  id: number;
  nome: string;
  modalidade_id: number;
  observacoes?: string;
  athletes?: {
    id: number;
    atleta_id: string;
    atleta_nome: string;
    posicao: number;
    raia: number;
    tipo_documento: string;
    numero_documento: string;
  }[];
  modalidades?: {
    id: number;
    nome: string;
    categoria: string;
  };
}

// Add missing Modality type for ModalitySelector
export interface Modality {
  modalidade_id: number;
  modalidade_nome: string;
  categoria: string;
}

export interface AvailableAthlete {
  id: string;
  nome: string;
  documento: string;
  filial_nome?: string;
}
