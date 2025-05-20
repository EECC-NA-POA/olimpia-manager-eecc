
export interface ScheduleItem {
  id: string;
  evento_id: string;
  titulo: string;
  descricao: string;
  local: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  tipo: string;
}

export interface ScheduleForm {
  titulo: string;
  descricao: string;
  local: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  tipo: string;
}
