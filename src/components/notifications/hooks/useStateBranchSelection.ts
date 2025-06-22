
import { useState } from 'react';

export function useStateBranchSelection() {
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({});

  const handleToggleState = (estado: string) => {
    setExpandedStates(prev => ({
      ...prev,
      [estado]: !prev[estado]
    }));
  };

  return {
    expandedStates,
    handleToggleState
  };
}
