
import React from 'react';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

interface SessionTimeoutProviderProps {
  children: React.ReactNode;
}

export const SessionTimeoutProvider = ({ children }: SessionTimeoutProviderProps) => {
  useSessionTimeout({
    timeoutMinutes: 30, // 30 minutos de inatividade
    checkIntervalMinutes: 5 // Verifica a cada 5 minutos
  });

  return <>{children}</>;
};
