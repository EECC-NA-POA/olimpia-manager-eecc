
import React from 'react';
import { Capacitor } from '@capacitor/core';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

interface SessionTimeoutProviderProps {
  children: React.ReactNode;
}

export const SessionTimeoutProvider = ({ children }: SessionTimeoutProviderProps) => {
  // On native mobile, don't use the short inactivity timeout.
  // Mobile sessions persist for 30 days (handled by storageAdapter + AuthProvider).
  // The 30-min timeout is only for the web admin panel.
  const isNative = Capacitor.isNativePlatform();

  useSessionTimeout({
    timeoutMinutes: isNative ? 0 : 30,       // Disabled on mobile, 30 min on web
    checkIntervalMinutes: isNative ? 0 : 5,  // Disabled on mobile, 5 min on web
    enabled: !isNative                        // Completely skip on native
  });

  return <>{children}</>;
};
