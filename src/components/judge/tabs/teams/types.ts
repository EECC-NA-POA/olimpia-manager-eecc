
export interface TeamsTabProps {
  userId: string;
  eventId: string | null;
  isOrganizer?: boolean;
}

export interface Team {
  id: number;
  nome: string;
  cor_uniforme?: string;
  observacoes?: string;
  modalidade_id: number;
  modalidade?: string;
  modalidades?: {
    nome?: string;
    categoria?: string;
  };
  athletes?: TeamAthlete[];
}

export interface TeamAthlete {
  id: number;
  atleta_id: string;
  atleta_nome: string;
  posicao: number;
  raia?: number;
  tipo_documento?: string;
  numero_documento?: string;
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
