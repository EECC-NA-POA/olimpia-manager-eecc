
import React from 'react';

interface DelegationInfoMessageProps {
  isBranchFiltered: boolean;
}

export function DelegationInfoMessage({ isBranchFiltered }: DelegationInfoMessageProps) {
  if (!isBranchFiltered) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
      <p className="text-sm text-blue-700">
        Como representante de delegação, esta notificação será enviada apenas para membros da sua filial.
      </p>
    </div>
  );
}
