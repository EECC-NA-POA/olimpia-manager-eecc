
import React from 'react';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

interface SessionTimeoutProviderProps {
  children: React.ReactNode;
}

export const SessionTimeoutProvider = ({ children }: SessionTimeoutProviderProps) => {
  useSessionTimeout({
    timeoutMinutes: 30, // 30 minutos de inatividade
    checkIntervalMinutes: 1 // Verifica a cada 1 minuto
  });

  return <>{children}</>;
};
