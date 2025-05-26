
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ScheduleItem } from '../types';

export const useScheduleFetch = (eventId: string | null) => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSchedule = async () => {
    if (!eventId) return;
    
    setIsLoading(true);
    try {
      console.log('Fetching schedule for event:', eventId);
      
      // Query the cronogramas table with proper ordering
      const { data, error } = await supabase
        .from('cronogramas')
        .select('*')
        .eq('evento_id', eventId)
        .order('data', { ascending: true })
        .order('hora_inicio', { ascending: true });
      
      if (error) {
        console.error('Error fetching schedule:', error);
        toast.error('Erro ao carregar cronograma');
        setScheduleItems([]);
        return;
      }
      
      console.log('Retrieved schedule items:', data);
      setScheduleItems(data || []);
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
