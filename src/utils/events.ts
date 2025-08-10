
export function extractRootDomain(hostname: string): string {
  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname;

  const host = hostname.toLowerCase();
  const br2ld = ['com.br', 'org.br', 'gov.br', 'edu.br', 'net.br'];
  const matchBr = br2ld.find(s => host.endsWith(`.${s}`));
  if (matchBr) {
    const segments = matchBr.split('.').length + 1; // e.g., com.br -> 2 + 1 = 3
    return parts.slice(-segments).join('.');
  }
  return parts.slice(-2).join('.');
}

export function buildEventUrl(event: any): string {
  const pagina = event?.pagina_evento as string | undefined;
  const slug = event?.slug_pagina as string | undefined;

  if (typeof window === 'undefined') {
    return slug ? `/event/${slug}` : `/events/${event?.id}`;
  }

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  if (pagina) {
    if (hostname.includes('localhost')) {
      // Fallback em dev para rota interna (sem wildcard subdomain)
      return slug ? `/event/${slug}` : `/events/${event?.id}`;
    }
    const base = extractRootDomain(hostname);
    return `${protocol}//${pagina}.${base}`;
  }

  if (slug) return `/event/${slug}`;
  return `/events/${event?.id}`;
}
