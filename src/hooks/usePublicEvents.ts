
import { useQuery } from '@tanstack/react-query';
import { publicFetch } from '@/lib/api/publicFetch';
import type { Event } from '@/lib/types/database';

export interface PublicEventsResult {
  active: Event[];
  closed: Event[];
}

export function usePublicEvents() {
  return useQuery<PublicEventsResult>({
    queryKey: ['public-events'],
    queryFn: async () => {
      const [active, closed] = await Promise.all([
        publicFetch<Event>('vw_eventos_publicos_ativos', { select: '*' }),
        publicFetch<Event>('vw_eventos_publicos_encerrados', { select: '*' }),
      ]);
      return { active, closed };
    },
    staleTime: 60_000,
    retry: 3,
    retryDelay: (attempt) => Math.min(2_000 * 2 ** attempt, 15_000),
    refetchOnReconnect: true,
  });
}
