
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Event } from "@/lib/types/database";

export const useEventData = (currentEventId: string | null) => {
  return useQuery({
    queryKey: ['event', currentEventId],
    queryFn: async () => {
      if (!currentEventId) {
        throw new Error('Nenhum evento selecionado');
      }
      
      console.log('🔍 Fetching event data for:', currentEventId);
      
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', currentEventId)
        .single();

      if (error) {
        console.error('❌ Error fetching event:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Evento não encontrado');
      }

      console.log('✅ Event data loaded successfully');
      return data as Event;
    },
    enabled: !!currentEventId,
    retry: 2,
  });
};
