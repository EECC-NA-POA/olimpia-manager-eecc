
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AthleteManagement } from '@/lib/api';
import { AthleteCard } from './athlete-card/components/AthleteCard';
import { AthleteDialogContent } from './athlete-card/AthleteDialogContent';
import { ExemptionCheckbox } from './athlete-card/ExemptionCheckbox';
import { useAthleteCardData } from './athlete-card/hooks/useAthleteCardData';
import { useExemptionStatus } from './athlete-card/hooks/useExemptionStatus';
import { useModalityHandlers } from './athlete-card/hooks/useModalityHandlers';
import { usePaymentHandlers } from './athlete-card/hooks/usePaymentHandlers';

interface AthleteRegistrationCardProps {
  registration: AthleteManagement;
  onStatusChange: (modalityId: string, status: string, justification: string) => Promise<void>;
  onPaymentStatusChange?: (athleteId: string, status: string) => Promise<void>;
  isCurrentUser: boolean;
  readOnly?: boolean;
}

export function AthleteRegistrationCard({
  registration,
  onStatusChange,
  onPaymentStatusChange,
  isCurrentUser,
  readOnly = false
}: AthleteRegistrationCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    paymentData,
    refetchPayment,
    registradorInfo,
    isDependent
  } = useAthleteCardData(registration);

  const { isExempt, isUpdatingExemption, handleExemptionChange } = useExemptionStatus({
    userId: registration.id,
    eventId: registration.evento_id,
    isCurrentUser,
    refetchPayment
  });

  const {
    justifications,
    setJustifications,
    isUpdating,
    setIsUpdating,
    modalityStatuses,
    setModalityStatuses,
    handleJustificationChange,
    handleStatusChange
  } = useModalityHandlers({ onStatusChange });

  const {
    isUpdatingAmount,
    setIsUpdatingAmount,
    localInputAmount,
    setLocalInputAmount,
    handleAmountInputChange,
    handleSaveAmount,
    handleAmountBlur
  } = usePaymentHandlers({
    athleteId: registration.id,
    paymentData,
    refetchPayment
  });

  // Initialize localInputAmount when payment data is loaded
  useEffect(() => {
    if (paymentData?.valor && !localInputAmount) {
      setLocalInputAmount(paymentData.valor.toString());
    }
  }, [paymentData?.valor]);

  const getStatusBadgeStyle = (status: string): string => {
    switch (status) {
      case 'confirmado':
        return 'bg-success-background text-success-foreground border-success/20';
      case 'pendente':
        return 'bg-warning-background text-warning-foreground border-warning/20';
      case 'cancelado':
        return 'bg-destructive/10 text-destructive-foreground border-destructive/20';
      default:
        return 'bg-neutral-background text-neutral-foreground border-neutral/20';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmado':
        return 'border-l-4 border-l-success bg-success-background/50';
      case 'pendente':
        return 'border-l-4 border-l-warning bg-warning-background/50';
      case 'cancelado':
        return 'border-l-4 border-l-destructive bg-destructive/5';
      default:
        return 'border-l-4 border-l-neutral bg-neutral-background/50';
    }
  };

  const handleWhatsAppClick = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${cleanPhone}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <div onClick={() => setIsDialogOpen(true)} className="cursor-pointer">
        <AthleteCard
          registration={registration}
          isCurrentUser={isCurrentUser}
          getStatusBadgeStyle={getStatusBadgeStyle}
          getStatusColor={getStatusColor}
          onWhatsAppClick={handleWhatsAppClick}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AthleteDialogContent
            nome={registration.nome_atleta || ''}
            numeroIdentificador={registration.numero_identificador}
            isDependent={isDependent}
            isExempt={isExempt}
            email={registration.email}
            telefone={registration.telefone}
            filialNome={registration.filial_nome || ''}
            tipoDocumento={registration.tipo_documento}
            numeroDocumento={registration.numero_documento}
            genero={registration.genero}
            onWhatsAppClick={handleWhatsAppClick}
            registradorInfo={registradorInfo}
            onPaymentStatusChange={onPaymentStatusChange ? (status) => onPaymentStatusChange(registration.id, status) : undefined}
            paymentControlProps={{
              value: localInputAmount,
              disabled: isUpdatingAmount || isExempt || readOnly,
              isUpdating: isUpdatingAmount,
              onInputChange: handleAmountInputChange,
              onSave: handleSaveAmount,
              onBlur: handleAmountBlur
            }}
            modalitiesProps={registration.modalidades.length > 0 ? {
              modalidades: registration.modalidades,
              justifications,
              isUpdating,
              modalityStatuses,
              getStatusBadgeStyle,
              onJustificationChange: handleJustificationChange,
              onStatusChange: handleStatusChange
            } : undefined}
            feeInfo={paymentData?.taxas_inscricao ? {
              valor: paymentData.taxas_inscricao.valor,
              isento: paymentData.taxas_inscricao.isento,
              pix_key: paymentData.taxas_inscricao.pix_key,
              qr_code_image: paymentData.taxas_inscricao.qr_code_image,
              qr_code_codigo: paymentData.taxas_inscricao.qr_code_codigo,
              perfil: paymentData.taxas_inscricao.perfil
            } : undefined}
            readOnly={readOnly}
          />

          <ExemptionCheckbox
            isCurrentUser={isCurrentUser}
            isExempt={isExempt}
            isUpdatingExemption={isUpdatingExemption}
            onExemptionChange={handleExemptionChange}
            disabled={readOnly}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
