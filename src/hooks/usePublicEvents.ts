
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Event } from '@/lib/types/database';

export interface PublicEventsResult {
  active: Event[];
  closed: Event[];
}

export function usePublicEvents() {
  return useQuery<PublicEventsResult>({
    queryKey: ['public-events'],
    queryFn: async () => {
      const [activeRes, closedRes] = await Promise.all([
        supabase.from('vw_eventos_publicos_ativos').select('*'),
        supabase.from('vw_eventos_publicos_encerrados').select('*')
      ]);

      if (activeRes.error) throw activeRes.error;
      if (closedRes.error) throw closedRes.error;

      return {
        active: (activeRes.data || []) as Event[],
        closed: (closedRes.data || []) as Event[],
      };
    },
    staleTime: 60_000,
  });
}
