
import { useState } from 'react';

interface UseModalityHandlersProps {
  onStatusChange: (modalityId: string, status: string, justification: string) => Promise<void>;
}

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
    
    setIsUpdating(prev => ({ ...prev, [modalityId]: true }));
    setModalityStatuses(prev => ({ ...prev, [modalityId]: status }));
    
    try {
      await onStatusChange(modalityId, status, justification);
    } catch (error) {
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
