
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
