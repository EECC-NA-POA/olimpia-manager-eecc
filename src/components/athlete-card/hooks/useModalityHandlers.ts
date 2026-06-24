
import { useState } from 'react';
import { toast } from 'sonner';

interface UseModalityHandlersProps {
  onStatusChange: (modalityId: string, status: string, justification: string) => Promise<void>;
}

const REQUIRES_JUSTIFICATION = ['pendente', 'cancelado'];

export const useModalityHandlers = ({ onStatusChange }: UseModalityHandlersProps) => {
  const [justifications, setJustifications] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [modalityStatuses, setModalityStatuses] = useState<Record<string, string>>({});

  const handleJustificationChange = (modalityId: string, value: string) => {
    setJustifications(prev => ({
      ...prev,
      [modalityId]: value
    }));
  };

  const handleStatusChange = async (modalityId: string, status: string) => {
    const justification = justifications[modalityId] || '';

    if (REQUIRES_JUSTIFICATION.includes(status) && !justification.trim()) {
      toast.error('Justificativa obrigatória para alterações para pendente ou cancelado.');
      return;
    }

    setIsUpdating(prev => ({ ...prev, [modalityId]: true }));
    setModalityStatuses(prev => ({ ...prev, [modalityId]: status }));

    try {
      await onStatusChange(modalityId, status, justification);
    } catch (error) {
      setModalityStatuses(prev => ({ ...prev, [modalityId]: '' }));
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(prev => ({ ...prev, [modalityId]: false }));
    }
  };

  return {
    justifications,
    setJustifications,
    isUpdating,
    setIsUpdating,
    modalityStatuses,
    setModalityStatuses,
    handleJustificationChange,
    handleStatusChange
  };
};
