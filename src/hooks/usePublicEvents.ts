
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
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('visibilidade_publica', true)
        .order('data_inicio_inscricao', { ascending: false });

      if (error) throw error;

      const events = (data || []) as Event[];
      return {
        active: events.filter(e => e.status_evento === 'ativo'),
        closed: events.filter(e => e.status_evento === 'encerrado'),
      };
    },
    staleTime: 60_000,
  });
}
