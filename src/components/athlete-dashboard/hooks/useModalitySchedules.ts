import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface ModalitySchedule {
  modalidade_id: number;
  dia: string | null;
  dia_semana: string | null;
  horario_inicio: string | null;
  horario_fim: string | null;
}

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
            evento_id
          )
        `)
        .eq('cronograma_atividades.evento_id', eventId);
      
      if (error) {
        console.error('Error fetching modality schedules:', error);
        throw error;
      }

      // Transform and group by modalidade_id
      const scheduleMap = new Map<number, ModalitySchedule>();
      
      (data || []).forEach((item: any) => {
        const activity = item.cronograma_atividades;
        const modalidadeId = item.modalidade_id;
        
        // Only use the first schedule found for each modality
        if (!scheduleMap.has(modalidadeId)) {
          let diaSemana: string | null = null;
          let dia: string | null = activity.dia;
          
          if (activity.recorrente && activity.dias_semana && activity.dias_semana.length > 0) {
            // For recurring activities, use the first day of the week
            diaSemana = activity.dias_semana[0];
          } else if (dia) {
            // Convert date to day of week
            const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            const date = new Date(dia + 'T00:00:00');
            diaSemana = dayNames[date.getDay()];
          }
          
          scheduleMap.set(modalidadeId, {
            modalidade_id: modalidadeId,
            dia,
            dia_semana: diaSemana,
            horario_inicio: activity.horario_inicio,
            horario_fim: activity.horario_fim
          });
        }
      });

      return Array.from(scheduleMap.values());
    },
    enabled: !!eventId,
  });
};

export const formatScheduleTime = (horarioInicio: string | null, horarioFim: string | null): string => {
  if (!horarioInicio) return '';
  const formatTime = (time: string) => time.substring(0, 5); // HH:MM
  if (horarioFim) {
    return `${formatTime(horarioInicio)} - ${formatTime(horarioFim)}`;
  }
  return formatTime(horarioInicio);
};
