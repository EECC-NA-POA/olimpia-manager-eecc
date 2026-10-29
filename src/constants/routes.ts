export const PUBLIC_ROUTES = ['/', '/olimpiadas-nacionais', '/torneio-concordia', '/login', '/forgot-password', '/reset-password', '/esqueci-senha', '/redefinir-senha', '/verificar-email', '/acesso-negado', '/event/:slug', '/m/login', '/m/register', '/register', '/m/forgot-password'] as const;
export type PublicRoute = (typeof PUBLIC_ROUTES)[number];

// Rotas com parâmetro (ex.: '/event/:slug') não casam por igualdade de string —
// comparar pelo prefixo antes do primeiro ':'.
export const isPublicRoute = (pathname: string): boolean =>
  PUBLIC_ROUTES.some((route) => {
    const paramIndex = route.indexOf(':');
    return paramIndex === -1 ? route === pathname : pathname.startsWith(route.slice(0, paramIndex));
  });

// Debug mode for additional console logs and development features
export const DEBUG_MODE = true;
