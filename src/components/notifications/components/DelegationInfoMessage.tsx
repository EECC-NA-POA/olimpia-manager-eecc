
import React from 'react';

interface DelegationInfoMessageProps {
  isRepresentanteDelegacao: boolean;
}

export function DelegationInfoMessage({ isRepresentanteDelegacao }: DelegationInfoMessageProps) {
  if (!isRepresentanteDelegacao) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
      <p className="text-sm text-blue-700">
        Como representante de delegação, esta notificação será visível para todos os participantes do evento.
      </p>
    </div>
  );
}
