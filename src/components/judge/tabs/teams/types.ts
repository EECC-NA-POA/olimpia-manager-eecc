
export interface Team {
  id: number;
  nome: string;
  cor_uniforme: string;
  observacoes: string;
  filial_id: string;
  evento_id: string;
  members: TeamMember[];
  athletes: TeamAthlete[]; // Added to maintain compatibility with existing code
  score?: ScoreRecord;
}

export interface TeamMember {
  id: string;
  name: string;
  numero_identificador?: string;
  documento?: string;
}

export interface TeamAthlete {
  id: number;
  atleta_id: string;
  posicao: number;
  raia?: number | null;
  equipe_id: number;
  usuarios: {
    nome_completo: string;
    tipo_documento?: string;
    numero_documento?: string;
    numero_identificador?: string | null;
  };
}

export interface AvailableAthlete {
  atleta_id: string;
  name: string;
  atleta_nome?: string; // Added for compatibility
  documento_tipo: string;
  documento_numero: string;
  identificador?: string;
  tipo_documento?: string;
  numero_documento?: string;
  numero_identificador?: string | null;
}

export interface ScoreRecord {
  id?: number;
  valor_pontuacao?: number;
  tempo_minutos?: number;
  tempo_segundos?: number;
  tempo_milissegundos?: number;
  tipo_pontuacao?: 'time' | 'distance' | 'points';
  unidade?: string;
  posicao_final?: number;
  medalha?: string;
}

export interface TeamsTabProps {
  userId: string;
  eventId: string | null;
  isOrganizer?: boolean;
}

export interface Modality {
  modalidade_id: number;
  modalidade_nome: string;
  categoria: string;
  tipo_modalidade: string;
  tipo_pontuacao?: 'time' | 'distance' | 'points';
}

export interface UserInfo {
  id: string;
  filial_id: string;
}
