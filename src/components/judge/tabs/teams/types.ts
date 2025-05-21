
// Define explicit types for the teams feature
export interface UserInfo {
  id: string;
  filial_id: string;
}

export interface Modality {
  modalidade_id: number;
  modalidade_nome: string;
  categoria: string;
  tipo_modalidade: string;
}

export interface TeamAthlete {
  id: number;
  posicao: number;
  raia: number | null;
  atleta_id: string;
  usuarios: {
    nome_completo: string;
    email: string;
    telefone: string;
    tipo_documento: string;
    numero_documento: string;
  };
}

export interface Team {
  id: number;
  nome: string;
  athletes: TeamAthlete[];
}

export interface AvailableAthlete {
  atleta_id: string;
  atleta_nome: string;
  atleta_telefone: string;
  atleta_email: string;
  tipo_documento: string;
  numero_documento: string;
  filial_id?: string;
}

export interface TeamsTabProps {
  userId: string;
  eventId: string | null;
  isOrganizer?: boolean;
}
