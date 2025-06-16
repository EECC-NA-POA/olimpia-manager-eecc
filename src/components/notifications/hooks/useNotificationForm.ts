
import { useState } from 'react';

export const useNotificationForm = (userBranchId?: string, isOrganizer: boolean = false) => {
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<string[]>(
    isOrganizer ? [] : (userBranchId ? [userBranchId] : [])
  );

  const resetForm = () => {
    setTitulo('');
    setMensagem('');
    setSelectedBranches(isOrganizer ? [] : (userBranchId ? [userBranchId] : []));
  };

  return {
    titulo,
    setTitulo,
    mensagem,
    setMensagem,
    selectedBranches,
    setSelectedBranches,
    resetForm
  };
};
