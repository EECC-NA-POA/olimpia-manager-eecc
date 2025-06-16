
import { useState } from 'react';

export const useNotificationForm = (userBranchId?: string, isOrganizer: boolean = false) => {
  const [mensagem, setMensagem] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<string[]>(
    isOrganizer ? [] : (userBranchId ? [userBranchId] : [])
  );

  const resetForm = () => {
    setMensagem('');
    setSelectedBranches(isOrganizer ? [] : (userBranchId ? [userBranchId] : []));
  };

  return {
    mensagem,
    setMensagem,
    selectedBranches,
    setSelectedBranches,
    resetForm
  };
};
