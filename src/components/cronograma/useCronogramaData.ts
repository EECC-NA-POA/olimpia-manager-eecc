
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ScheduleActivity } from './types';
import { expandRecurrentActivity } from './utils';
import { parseISO, isValid, startOfDay, isBefore, addDays } from 'date-fns';

export function useCronogramaData() {
  const currentEventId = localStorage.getItem('currentEventId');

  const { data: activities, isLoading } = useQuery({
    queryKey: ['cronograma-activities', currentEventId],
    queryFn: async () => {
      console.log('Fetching cronograma activities for event:', currentEventId);
      
      const { data, error } = await supabase
        .from('cronograma_atividades')
        .select(`
          id,
          atividade,
          dia,
          horario_inicio,
          horario_fim,
          local,
          global,
          recorrente,
          dias_semana,
          horarios_por_dia,
          locais_por_dia,
          data_fim_recorrencia,
          cronograma_atividade_modalidades(
            modalidade_id,
            modalidades(
              nome,
              status
            )
          )
        `)
        .eq('evento_id', currentEventId)
        .order('dia', { ascending: true })
        .order('horario_inicio', { ascending: true });

      if (error) {
        console.error('Error fetching cronograma:', error);
        throw error;
      }

      console.log('Raw cronograma data:', data);

      // Transform and expand the data
      const transformedActivities: ScheduleActivity[] = [];
      
      (data || []).forEach(item => {
        const modalidades = item.cronograma_atividade_modalidades || [];
        
        if (modalidades.length === 0) {
          // Activity without specific modalities
          const baseActivity: ScheduleActivity = {
            id: item.id,
            cronograma_atividade_id: item.id,
            atividade: item.atividade,
            dia: item.dia,
            horario_inicio: item.horario_inicio,
            horario_fim: item.horario_fim,
            local: item.local,
            global: item.global,
            modalidade_nome: null,
            modalidade_status: null,
            recorrente: item.recorrente || false,
            dias_semana: item.dias_semana || [],
            horarios_por_dia: item.horarios_por_dia || {},
            locais_por_dia: item.locais_por_dia || {},
            data_fim_recorrencia: item.data_fim_recorrencia || ''
          };
          
          // Expand recurrent activities
          const expandedActivities = expandRecurrentActivity(baseActivity);
          transformedActivities.push(...expandedActivities);
        } else {
          // Activity with specific modalities
          modalidades.forEach((mod: any) => {
            const baseActivity: ScheduleActivity = {
              id: item.id,
              cronograma_atividade_id: item.id,
              atividade: item.atividade,
              dia: item.dia,
              horario_inicio: item.horario_inicio,
              horario_fim: item.horario_fim,
              local: item.local,
              global: item.global,
              modalidade_nome: mod.modalidades?.nome || null,
              modalidade_status: mod.modalidades?.status || null,
              recorrente: item.recorrente || false,
              dias_semana: item.dias_semana || [],
              horarios_por_dia: item.horarios_por_dia || {},
              locais_por_dia: item.locais_por_dia || {},
              data_fim_recorrencia: item.data_fim_recorrencia || ''
            };
            
            // Expand recurrent activities
            const expandedActivities = expandRecurrentActivity(baseActivity);
            transformedActivities.push(...expandedActivities);
          });
        }
      });

      console.log('Transformed and expanded activities:', transformedActivities);
      return transformedActivities;
    },
    enabled: !!currentEventId,
  });

// Filter out past punctual (non-recurrent) activities
const todayStart = startOfDay(new Date());
const visibleActivities = (activities || []).filter((a: any) => {
  const isRecurrent = Array.isArray(a.dias_semana) && a.dias_semana.length > 0;
  if (isRecurrent) return true;
  if (!a.dia) return true;
  const key = String(a.dia);
  if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    try {
      const d = parseISO(key);
      // Keep visible until one day after the activity date
      return isValid(d) && !isBefore(addDays(d, 1), todayStart);
    } catch {
      return true;
    }
  }
  return true;
});

// Group activities by date and time
const groupedActivities = visibleActivities.reduce((groups: any, activity: any) => {
  const date = activity.dia;
  const time = `${activity.horario_inicio}-${activity.horario_fim}`;
  
  if (!groups[date]) {
    groups[date] = {};
  }
  
  if (!groups[date][time]) {
    groups[date][time] = [];
  }
  
  groups[date][time].push(activity);
  
  return groups;
}, {});

// Get unique dates (now will include all days from recurrent activities)
const dates = Object.keys(groupedActivities || {}).sort((a, b) => {
  // Sort days of week in logical order
  const dayOrder = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  const indexA = dayOrder.indexOf(a);
  const indexB = dayOrder.indexOf(b);
  
  // If both are day keys, sort by day order
  if (indexA !== -1 && indexB !== -1) {
    return indexA - indexB;
  }
  
  // If they're dates, sort alphabetically (which works for ISO dates)
  return a.localeCompare(b);
});

// Get unique time slots
const timeSlots = [...new Set(
  visibleActivities.map((activity: any) => `${activity.horario_inicio}-${activity.horario_fim}`)
)].sort();

  return {
    activities,
    isLoading,
    groupedActivities: groupedActivities || {},
    dates,
    timeSlots
  };
}
