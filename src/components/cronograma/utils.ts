
import { ScheduleActivity } from './types';
import { parseISO, format, isValid } from 'date-fns';

// Helper function to get day label in Portuguese or format ISO dates to dd/MM/yyyy
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

  // If the key is an ISO date (YYYY-MM-DD), return in Brazilian format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) {
    try {
      const d = parseISO(dayKey);
      if (isValid(d)) {
        return format(d, 'dd/MM/yyyy');
      }
    } catch (e) {
      // fallback to original key
    }
    return dayKey;
  }

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
