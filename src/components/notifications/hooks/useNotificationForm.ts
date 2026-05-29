
import { useState } from 'react';

export const useNotificationForm = (userBranchIds?: string[], isOrganizer: boolean = false) => {
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');

  // Para representante de delegação, usar TODAS as filiais da delegação
  // Para organizador, começar vazio para que ele escolha
  const [selectedBranches, setSelectedBranches] = useState<string[]>(
    !isOrganizer && userBranchIds && userBranchIds.length > 0 ? [...userBranchIds] : []
  );

  console.log('useNotificationForm initialized:', {
    userBranchIds,
    isOrganizer,
    initialSelectedBranches: selectedBranches
  });

  const resetForm = () => {
    setTitulo('');
    setMensagem('');
    setSelectedBranches(!isOrganizer && userBranchIds && userBranchIds.length > 0 ? [...userBranchIds] : []);
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
