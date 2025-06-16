
import { useState } from 'react';

export const useNotificationForm = (userBranchId?: string, isOrganizer: boolean = false) => {
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  
  // Para representante de delegação, sempre usar sua filial
  // Para organizador, começar vazio para que ele escolha
  const [selectedBranches, setSelectedBranches] = useState<string[]>(
    !isOrganizer && userBranchId ? [userBranchId] : []
  );

  console.log('useNotificationForm initialized:', {
    userBranchId,
    isOrganizer,
    initialSelectedBranches: selectedBranches
  });

  const resetForm = () => {
    setTitulo('');
    setMensagem('');
    setSelectedBranches(!isOrganizer && userBranchId ? [userBranchId] : []);
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
