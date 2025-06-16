
import React, { useState } from 'react';
import { NotificationFormFields } from './components/NotificationFormFields';
import { DelegationInfoMessage } from './components/DelegationInfoMessage';
import { useNotificationForm } from './hooks/useNotificationForm';
import { validateNotificationForm } from './utils/validation';
import { submitNotification } from './services/notificationService';
import { toast } from "sonner";
import type { NotificationAuthorType } from '@/types/notifications';

interface NotificationFormProps {
  eventId: string;
  userId: string;
  onSuccess: () => void;
  isRepresentanteDelegacao?: boolean;
  isOrganizer?: boolean;
}

export function NotificationForm({ 
  eventId, 
  userId, 
  onSuccess,
  isRepresentanteDelegacao = false,
  isOrganizer = false
}: NotificationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    mensagem,
    setMensagem,
    resetForm
  } = useNotificationForm();

  // Determinar o tipo de autor baseado nos props
  const tipoAutor: NotificationAuthorType = isOrganizer ? 'organizador' : 'representante_delegacao';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = validateNotificationForm(mensagem);

    if (!isValid) return;

    setIsSubmitting(true);

    try {
      await submitNotification(
        { mensagem, eventId },
        userId,
        tipoAutor
      );
      
      resetForm();
      onSuccess();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Erro ao criar notificação: ' + (error as any)?.message || 'Erro desconhecido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <NotificationFormFields
        mensagem={mensagem}
        setMensagem={setMensagem}
        isSubmitting={isSubmitting}
      />

      <DelegationInfoMessage isRepresentanteDelegacao={isRepresentanteDelegacao} />
    </form>
  );
}
