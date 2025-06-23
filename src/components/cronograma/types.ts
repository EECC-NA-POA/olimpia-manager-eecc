
export interface ScheduleActivity {
  id: number;
  cronograma_atividade_id: number;
  atividade: string;
  local: string;
  modalidade_nome: string | null;
  modalidade_status: string | null;
  global: boolean;
  recorrente?: boolean;
  dias_semana?: string[];
  horarios_por_dia?: Record<string, { inicio: string; fim: string }>;
  locais_por_dia?: Record<string, string>;
  data_fim_recorrencia?: string;
  dia?: string;
  horario_inicio?: string;
  horario_fim?: string;
  atleta_id?: string; // Added to make it compatible with AthleteSchedule
}

export interface GroupedActivities {
  [key: string]: {
    [key: string]: ScheduleActivity[];
  };
}
