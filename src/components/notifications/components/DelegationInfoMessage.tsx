
import React from 'react';

interface DelegationInfoMessageProps {
  isRepresentanteDelegacao: boolean;
}

export function DelegationInfoMessage({ isRepresentanteDelegacao }: DelegationInfoMessageProps) {
  if (!isRepresentanteDelegacao) {
    return null;
  }

  return (
    <div className="bg-info-background border border-info/20 rounded-md p-3">
      <p className="text-sm text-info-foreground">
        Como representante de delegação, esta notificação será visível para todos os participantes do evento.
      </p>
    </div>
  );
}
