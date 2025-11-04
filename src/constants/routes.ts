
export const PUBLIC_ROUTES = ['/', '/olimpiadas-nacionais', '/torneio-concordia', '/login', '/forgot-password', '/reset-password', '/esqueci-senha', '/redefinir-senha', '/verificar-email', '/acesso-negado', '/event/:slug'] as const;
export type PublicRoute = (typeof PUBLIC_ROUTES)[number];

// Debug mode for additional console logs and development features
export const DEBUG_MODE = true;
