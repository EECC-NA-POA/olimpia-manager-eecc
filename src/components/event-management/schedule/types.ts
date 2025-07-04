
export interface Cronograma {
  id: number;
  nome: string;
  descricao: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  created_at: string | null;
  updated_at: string | null;
  evento_id: string;
}

export interface CronogramaAtividade {
  id: number;
  cronograma_id: number;
  dia: string;
  atividade: string;
  horario_inicio: string;
  horario_fim: string;
  local: string;
  ordem: number | null;
  global: boolean;
  evento_id: string;
  recorrente?: boolean;
  dias_semana?: string[];
  horarios_por_dia?: Record<string, { inicio: string; fim: string }>;
  locais_por_dia?: Record<string, string>;
  data_fim_recorrencia?: string;
  modalidades?: { modalidade_id: number }[];
}

export interface ScheduleItem {
  id: number;
  cronograma_id: number;
  cronograma_nome: string;
  dia: string;
  atividade: string;
  horario_inicio: string;
  horario_fim: string;
  local: string;
  ordem: number | null;
  global: boolean;
  evento_id: string;
  recorrente?: boolean;
  dias_semana?: string[];
  horarios_por_dia?: Record<string, { inicio: string; fim: string }>;
  locais_por_dia?: Record<string, string>;
  data_fim_recorrencia?: string;
  modalidades: number[];
}

export interface ScheduleForm {
  cronograma_id: number | null;
  atividade: string;
  dia: string;
  horario_inicio: string;
  horario_fim: string;
  local: string;
  global: boolean;
  recorrente: boolean;
  dias_semana: string[];
  horarios_por_dia: Record<string, { inicio: string; fim: string }>;
  locais_por_dia: Record<string, string>;
  data_fim_recorrencia: string;
  modalidades: number[];
}
