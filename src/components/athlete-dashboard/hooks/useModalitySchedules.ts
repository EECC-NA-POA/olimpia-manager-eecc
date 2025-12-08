import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface ModalityScheduleItem {
  modalidade_id: number;
  dia: string | null;
  dia_semana: string;
  horario_inicio: string | null;
  horario_fim: string | null;
  local: string | null;
}

// Return type: array of schedule items (multiple per modality possible)
export type ModalitySchedule = ModalityScheduleItem;

export const useModalitySchedules = (eventId: string | null) => {
  return useQuery({
    queryKey: ['modality-schedules', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      // Fetch activities linked to modalities via cronograma_atividade_modalidades
      const { data, error } = await supabase
        .from('cronograma_atividade_modalidades')
        .select(`
          modalidade_id,
          cronograma_atividades!inner (
            dia,
            dias_semana,
            horario_inicio,
            horario_fim,
            recorrente,
            horarios_por_dia,
            local,
            locais_por_dia,
            evento_id
          )
        `)
        .eq('cronograma_atividades.evento_id', eventId);
      
      if (error) {
        console.error('Error fetching modality schedules:', error);
        throw error;
      }

      const schedules: ModalityScheduleItem[] = [];
      const dayNameMap: Record<string, string> = {
        'segunda': 'Segunda-feira',
        'terça': 'Terça-feira',
        'terca': 'Terça-feira',
        'quarta': 'Quarta-feira',
        'quinta': 'Quinta-feira',
        'sexta': 'Sexta-feira',
        'sábado': 'Sábado',
        'sabado': 'Sábado',
        'domingo': 'Domingo'
      };

      const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      
      (data || []).forEach((item: any) => {
        const activity = item.cronograma_atividades;
        const modalidadeId = item.modalidade_id;
        
        if (activity.recorrente && activity.dias_semana && activity.dias_semana.length > 0) {
          // For recurring activities, create one schedule per day in dias_semana
          activity.dias_semana.forEach((diaOriginal: string) => {
            const diaLower = diaOriginal.toLowerCase();
            const diaSemana = dayNameMap[diaLower] || diaOriginal;
            
            let horarioInicio: string | null = null;
            let horarioFim: string | null = null;
            let local: string | null = activity.local || null;
            
            // Extract times from horarios_por_dia JSONB field
            // Try both original key and lowercase key for robustness
            if (activity.horarios_por_dia) {
              const horariosDoDia = activity.horarios_por_dia[diaOriginal] || activity.horarios_por_dia[diaLower];
              if (horariosDoDia) {
                horarioInicio = horariosDoDia.inicio || null;
                horarioFim = horariosDoDia.fim || null;
              }
            }
            
            // Extract location from locais_por_dia JSONB field
            // Try both original key and lowercase key for robustness
            if (activity.locais_por_dia) {
              local = activity.locais_por_dia[diaOriginal] || activity.locais_por_dia[diaLower] || local;
            }
            
            schedules.push({
              modalidade_id: modalidadeId,
              dia: null,
              dia_semana: diaSemana,
              horario_inicio: horarioInicio,
              horario_fim: horarioFim,
              local
            });
          });
        } else if (activity.dia) {
          // For non-recurring activities, use direct date and times
          const date = new Date(activity.dia + 'T00:00:00');
          const diaSemana = dayNames[date.getDay()];
          
          schedules.push({
            modalidade_id: modalidadeId,
            dia: activity.dia,
            dia_semana: diaSemana,
            horario_inicio: activity.horario_inicio,
            horario_fim: activity.horario_fim,
            local: activity.local || null
          });
        }
      });

      return schedules;
    },
    enabled: !!eventId,
  });
};

export const getSchedulesForModality = (
  modalityId: number, 
  schedules: ModalityScheduleItem[]
): ModalityScheduleItem[] => {
  return schedules.filter(s => s.modalidade_id === modalityId);
};

export const formatScheduleTime = (horarioInicio: string | null, horarioFim: string | null): string => {
  if (!horarioInicio) return '';
  const formatTime = (time: string) => time.substring(0, 5); // HH:MM
  if (horarioFim) {
    return `${formatTime(horarioInicio)} - ${formatTime(horarioFim)}`;
  }
  return formatTime(horarioInicio);
};
