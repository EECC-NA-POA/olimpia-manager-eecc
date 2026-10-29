import { useQuery } from '@tanstack/react-query';
import { publicRpc } from '@/lib/api/publicFetch';
import type { PublicPageData } from '@/lib/publicPages';

/** Dados da página pública de divulgação; null quando o slug não existe ou a página está desligada. */
export function usePublicEventPage(slug: string | undefined) {
  return useQuery<PublicPageData | null>({
    queryKey: ['public-event-page', slug],
    queryFn: () => publicRpc<PublicPageData | null>('get_pagina_publica_evento', { p_slug: slug }),
    enabled: !!slug,
    staleTime: 60_000,
    retry: 2,
  });
}
