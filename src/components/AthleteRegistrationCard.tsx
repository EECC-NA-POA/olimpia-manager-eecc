import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { AthleteManagement } from '@/lib/api';
import { AthleteCard } from './athlete-card/components/AthleteCard';
import { AthleteDialogContent } from './athlete-card/AthleteDialogContent';
import { useAthleteCardData } from './athlete-card/hooks/useAthleteCardData';
import { updatePaymentAmount } from '@/lib/api/payments';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

interface AthleteRegistrationCardProps {
  registration: AthleteManagement;
  onStatusChange: (modalityId: string, status: string, justification: string) => Promise<void>;
  onPaymentStatusChange?: (athleteId: string, status: string) => Promise<void>;
  isCurrentUser: boolean;
}

export function AthleteRegistrationCard({
  registration,
  onStatusChange,
  onPaymentStatusChange,
  isCurrentUser
}: AthleteRegistrationCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExempt, setIsExempt] = useState(false);
  const [isUpdatingExemption, setIsUpdatingExemption] = useState(false);
  const queryClient = useQueryClient();

  const {
    justifications,
    setJustifications,
    isUpdating,
    setIsUpdating,
    modalityStatuses,
    setModalityStatuses,
    isUpdatingAmount,
    setIsUpdatingAmount,
    localInputAmount,
    setLocalInputAmount,
    paymentData,
    refetchPayment,
    registradorInfo,
    isDependent
  } = useAthleteCardData(registration);

  // Check if user is exempt
  useEffect(() => {
    const checkExemptionStatus = async () => {
      if (!isCurrentUser) return;
      
      try {
        const { data } = await supabase
          .from('inscricoes_eventos')
          .select('isento')
          .eq('usuario_id', registration.id)
          .eq('evento_id', registration.evento_id)
          .single();
        
        if (data) {
          setIsExempt(data.isento || false);
        }
      } catch (error) {
        console.error('Error checking exemption status:', error);
      }
    };

    checkExemptionStatus();
  }, [isCurrentUser, registration.id, registration.evento_id]);

  const handleExemptionChange = async (checked: boolean) => {
    if (!isCurrentUser) return;
    
    setIsUpdatingExemption(true);
    try {
      // Update exemption status
      const { error: exemptError } = await supabase
        .from('inscricoes_eventos')
        .update({ isento: checked })
        .eq('usuario_id', registration.id)
        .eq('evento_id', registration.evento_id);

      if (exemptError) throw exemptError;

      // If marking as exempt, set payment amount to 0
      if (checked) {
        await updatePaymentAmount(registration.id, 0);
      }

      setIsExempt(checked);
      await refetchPayment();
      
      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ 
        queryKey: ['athlete-management', registration.evento_id]
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['branch-analytics', registration.evento_id]
      });

      toast.success(checked ? 'Marcado como isento com sucesso!' : 'Isenção removida com sucesso!');
    } catch (error) {
      console.error('Error updating exemption:', error);
      toast.error('Erro ao atualizar status de isenção');
    } finally {
      setIsUpdatingExemption(false);
    }
  };

  const getStatusBadgeStyle = (status: string): string => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmado':
        return 'border-l-4 border-l-green-500 bg-green-50/50';
      case 'pendente':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50/50';
      case 'cancelado':
        return 'border-l-4 border-l-red-500 bg-red-50/50';
      default:
        return 'border-l-4 border-l-gray-500 bg-gray-50/50';
    }
  };

  const handleWhatsAppClick = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${cleanPhone}`;
    window.open(whatsappUrl, '_blank');
  };

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

  const handleAmountInputChange = (value: string) => {
    const numericValue = value.replace(/[^\d,]/g, '');
    setLocalInputAmount(numericValue);
  };

  const handleSaveAmount = async () => {
    if (!localInputAmount || isUpdatingAmount) return;
    
    setIsUpdatingAmount(true);
    try {
      const numericValue = parseFloat(localInputAmount.replace(',', '.'));
      if (isNaN(numericValue)) {
        toast.error('Valor inválido');
        return;
      }

      await updatePaymentAmount(registration.id, numericValue);
      await refetchPayment();
      toast.success('Valor atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating payment amount:', error);
      toast.error('Erro ao atualizar valor');
    } finally {
      setIsUpdatingAmount(false);
    }
  };

  const handleAmountBlur = () => {
    if (paymentData?.valor !== undefined) {
      const currentValue = paymentData.valor.toString().replace('.', ',');
      if (localInputAmount !== currentValue) {
        handleSaveAmount();
      }
    }
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
              disabled: isUpdatingAmount || isExempt,
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
          />

          {/* Exemption control for current user */}
          {isCurrentUser && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="exempt-checkbox"
                  checked={isExempt}
                  onCheckedChange={handleExemptionChange}
                  disabled={isUpdatingExemption}
                />
                <label htmlFor="exempt-checkbox" className="text-sm font-medium text-blue-700">
                  Marcar como isento (valor do pagamento será zerado)
                </label>
                {isUpdatingExemption && (
                  <div className="text-xs text-blue-600">Atualizando...</div>
                )}
              </div>
              {isExempt && (
                <div className="mt-2 text-xs text-blue-600">
                  ✓ Você está marcado como isento deste evento
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
