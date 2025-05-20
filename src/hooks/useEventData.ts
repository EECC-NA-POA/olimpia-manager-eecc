
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Event } from "@/types/athlete";

export const useEventData = (currentEventId: string | null) => {
  return useQuery({
    queryKey: ['event', currentEventId],
    queryFn: async () => {
      if (!currentEventId) return null;
      
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', currentEventId)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        return null;
      }

      return data as Event;
    },
    enabled: !!currentEventId,
  });
};
