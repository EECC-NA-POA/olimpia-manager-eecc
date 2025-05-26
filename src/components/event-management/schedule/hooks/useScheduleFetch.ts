
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ScheduleItem } from '../types';

export const useScheduleFetch = (eventId: string | null) => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSchedule = async () => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Fetching schedule for event:', eventId);
      
      // Query cronograma_atividades with join to cronogramas
      const { data, error } = await supabase
        .from('cronograma_atividades')
        .select(`
          id,
          cronograma_id,
          dia,
          atividade,
          horario_inicio,
          horario_fim,
          local,
          ordem,
          global,
          evento_id,
          cronogramas(
            id,
            nome
          ),
          cronograma_atividade_modalidades(
            modalidade_id
          )
        `)
        .eq('evento_id', eventId)
        .order('dia', { ascending: true })
        .order('horario_inicio', { ascending: true });
      
      if (error) {
        console.error('Error fetching schedule:', error);
        toast.error('Erro ao carregar cronograma');
        setScheduleItems([]);
        return;
      }
      
      console.log('Raw schedule data:', data);
      
      // Transform the data to match our ScheduleItem interface
      const transformedData: ScheduleItem[] = (data || []).map(item => {
        // Handle the cronogramas join - it's an array, so we take the first element
        const cronogramaData = Array.isArray(item.cronogramas) && item.cronogramas.length > 0 
          ? item.cronogramas[0] 
          : null;
        
        return {
          id: item.id,
          cronograma_id: item.cronograma_id,
          cronograma_nome: cronogramaData?.nome || 'Cronograma sem nome',
          dia: item.dia,
          atividade: item.atividade,
          horario_inicio: item.horario_inicio,
          horario_fim: item.horario_fim,
          local: item.local,
          ordem: item.ordem,
          global: item.global,
          evento_id: item.evento_id,
          modalidades: (item.cronograma_atividade_modalidades || []).map((m: any) => m.modalidade_id)
        };
      });
      
      console.log('Transformed schedule items:', transformedData);
      setScheduleItems(transformedData);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Erro ao carregar cronograma');
      setScheduleItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [eventId]);

  return {
    scheduleItems,
    isLoading,
    fetchSchedule,
    setScheduleItems
  };
};
