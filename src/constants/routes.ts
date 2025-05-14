
export const PUBLIC_ROUTES = ['/', '/login', '/forgot-password', '/reset-password'] as const;
export type PublicRoute = (typeof PUBLIC_ROUTES)[number];

// Debug mode for additional console logs and development features
export const DEBUG_MODE = true;
