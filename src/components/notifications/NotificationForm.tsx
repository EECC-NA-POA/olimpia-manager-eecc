
import React, { useState } from 'react';
import { NotificationFormFields } from './components/NotificationFormFields';
import { BranchSelection } from './components/BranchSelection';
import { DelegationInfoMessage } from './components/DelegationInfoMessage';
import { useNotificationForm } from './hooks/useNotificationForm';
import { useBranches } from './hooks/useBranches';
import { validateNotificationForm } from './utils/validation';
import { submitNotification } from './services/notificationService';
import { toast } from "sonner";

interface NotificationFormProps {
  eventId: string;
  userId: string;
  onSuccess: () => void;
  isBranchFiltered?: boolean;
  branchId?: number;
  isOrganizer?: boolean;
}

export function NotificationForm({ 
  eventId, 
  userId, 
  onSuccess,
  isBranchFiltered = false,
  branchId,
  isOrganizer = false
}: NotificationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    titulo,
    setTitulo,
    conteudo,
    setConteudo,
    tipoDestinatario,
    setTipoDestinatario,
    dataExpiracao,
    setDataExpiracao,
    selectedBranches,
    handleBranchToggle,
    resetForm
  } = useNotificationForm();

  const { branches, loadingBranches } = useBranches(isOrganizer, isBranchFiltered);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = validateNotificationForm(
      titulo,
      conteudo,
      isOrganizer,
      tipoDestinatario,
      selectedBranches,
      isBranchFiltered,
      branchId
    );

    if (!isValid) return;

    setIsSubmitting(true);

    try {
      await submitNotification(
        { titulo, conteudo, eventId, dataExpiracao },
        isBranchFiltered,
        branchId,
        isOrganizer,
        tipoDestinatario,
        selectedBranches
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
        titulo={titulo}
        setTitulo={setTitulo}
        conteudo={conteudo}
        setConteudo={setConteudo}
        dataExpiracao={dataExpiracao}
        setDataExpiracao={setDataExpiracao}
        tipoDestinatario={tipoDestinatario}
        setTipoDestinatario={setTipoDestinatario}
        isOrganizer={isOrganizer}
        isBranchFiltered={isBranchFiltered}
        isSubmitting={isSubmitting}
      />

      <BranchSelection
        isOrganizer={isOrganizer}
        isBranchFiltered={isBranchFiltered}
        tipoDestinatario={tipoDestinatario}
        branches={branches}
        selectedBranches={selectedBranches}
        loadingBranches={loadingBranches}
        handleBranchToggle={handleBranchToggle}
      />

      <DelegationInfoMessage isBranchFiltered={isBranchFiltered} />
    </form>
  );
}
