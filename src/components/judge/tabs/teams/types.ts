
export interface Team {
  id: number;
  nome: string;
  cor_uniforme: string;
  observacoes: string;
  filial_id: string;
  evento_id: string;
  members: TeamMember[];
  score?: ScoreRecord;
}

export interface TeamMember {
  id: string;
  name: string;
  numero_identificador?: string;
  documento?: string;
}

export interface AvailableAthlete {
  atleta_id: string;
  name: string;
  documento_tipo: string;
  documento_numero: string;
  identificador?: string;
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
