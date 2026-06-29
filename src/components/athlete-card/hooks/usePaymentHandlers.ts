
import { useState } from 'react';
import { updatePaymentAmount } from '@/lib/api/payments';
import { toast } from 'sonner';

interface UsePaymentHandlersProps {
  athleteId: string;
  eventId: string;
  paymentData: any;
  refetchPayment: () => Promise<any>;
}

export const usePaymentHandlers = ({ athleteId, eventId, paymentData, refetchPayment }: UsePaymentHandlersProps) => {
  const [isUpdatingAmount, setIsUpdatingAmount] = useState(false);
  const [localInputAmount, setLocalInputAmount] = useState<string>('');

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

      await updatePaymentAmount(athleteId, numericValue, eventId);
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

  return {
    isUpdatingAmount,
    setIsUpdatingAmount,
    localInputAmount,
    setLocalInputAmount,
    handleAmountInputChange,
    handleSaveAmount,
    handleAmountBlur
  };
};
