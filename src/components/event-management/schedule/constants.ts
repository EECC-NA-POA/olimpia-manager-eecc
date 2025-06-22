
import { ScheduleForm } from './types';

export const defaultFormValues: ScheduleForm = {
  cronograma_id: null,
  atividade: '',
  dia: '',
  horario_inicio: '',
  horario_fim: '',
  local: '',
  global: false,
  recorrente: false,
  dias_semana: [],
  horarios_por_dia: {},
  data_fim_recorrencia: '',
  modalidades: []
};

export const diasSemana = [
  { value: 'segunda', label: 'Segunda-feira' },
  { value: 'terca', label: 'Terça-feira' },
  { value: 'quarta', label: 'Quarta-feira' },
  { value: 'quinta', label: 'Quinta-feira' },
  { value: 'sexta', label: 'Sexta-feira' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' }
];
