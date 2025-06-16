
import { useState } from 'react';
import type { NotificationTargetType } from '@/types/notifications';

export const useNotificationForm = () => {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [tipoDestinatario, setTipoDestinatario] = useState<NotificationTargetType>('todos');
  const [dataExpiracao, setDataExpiracao] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);

  const resetForm = () => {
    setTitulo('');
    setConteudo('');
    setTipoDestinatario('todos');
    setDataExpiracao('');
    setSelectedBranches([]);
  };

  const handleBranchToggle = (branchId: number) => {
    setSelectedBranches(prev => 
      prev.includes(branchId) 
        ? prev.filter(id => id !== branchId)
        : [...prev, branchId]
    );
  };

  return {
    titulo,
    setTitulo,
    conteudo,
    setConteudo,
    tipoDestinatario,
    setTipoDestinatario,
    dataExpiracao,
    setDataExpiracao,
    selectedBranches,
    setSelectedBranches,
    handleBranchToggle,
    resetForm
  };
};
