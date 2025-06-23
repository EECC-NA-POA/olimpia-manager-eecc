
import { ScheduleActivity } from './types';

// Helper function to get day label in Portuguese
export const getDayLabel = (dayKey: string): string => {
  const dayLabels: Record<string, string> = {
    'segunda': 'Segunda-feira',
    'terca': 'Terça-feira',
    'quarta': 'Quarta-feira',
    'quinta': 'Quinta-feira',
    'sexta': 'Sexta-feira',
    'sabado': 'Sábado',
    'domingo': 'Domingo'
  };
  return dayLabels[dayKey] || dayKey;
};

// Helper function to expand recurrent activities into daily activities
export function expandRecurrentActivity(activity: ScheduleActivity): ScheduleActivity[] {
  if (!activity.recorrente || !activity.dias_semana || !Array.isArray(activity.dias_semana)) {
    return [activity];
  }

  const expandedActivities: ScheduleActivity[] = [];

  activity.dias_semana.forEach(dia => {
    const horario = activity.horarios_por_dia?.[dia];
    const local = activity.locais_por_dia?.[dia];
    
    if (horario) {
      expandedActivities.push({
        ...activity,
        dia: dia, // Use the day key directly
        horario_inicio: horario.inicio,
        horario_fim: horario.fim,
        local: local || activity.local || '',
        recorrente: false // Mark as non-recurrent for display purposes
      });
    }
  });

  return expandedActivities.length > 0 ? expandedActivities : [activity];
}
