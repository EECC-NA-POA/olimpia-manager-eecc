
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UseExemptionStatusProps {
  userId: string;
  eventId: string;
  isCurrentUser: boolean;
  refetchPayment: () => Promise<any>;
}

export const useExemptionStatus = ({ 
  userId, 
  eventId, 
  isCurrentUser, 
  refetchPayment 
}: UseExemptionStatusProps) => {
  const [isExempt, setIsExempt] = useState(false);
  const [isUpdatingExemption, setIsUpdatingExemption] = useState(false);
  const queryClient = useQueryClient();

  // Check if user is exempt using pagamentos table
  useEffect(() => {
    const checkExemptionStatus = async () => {
      if (!isCurrentUser) return;
      
      try {
        console.log('Checking exemption status for user:', userId, 'event:', eventId);
        
        const { data, error } = await supabase
          .from('pagamentos')
          .select('isento, status')
          .eq('atleta_id', userId)
          .eq('evento_id', eventId)
          .single();
        
        if (error) {
          console.error('Error checking exemption status:', error);
          // If no payment record exists, assume not exempt
          setIsExempt(false);
          return;
        }
        
        console.log('Exemption data:', data);
        // Consider exempt if either isento flag is true OR status is "isento"
        setIsExempt(data?.isento || data?.status === 'isento');
      } catch (error) {
        console.error('Error in checkExemptionStatus:', error);
        setIsExempt(false);
      }
    };

    checkExemptionStatus();
  }, [isCurrentUser, userId, eventId]);

  const handleExemptionChange = async (checked: boolean) => {
    if (!isCurrentUser) return;
    
    setIsUpdatingExemption(true);
    console.log('Updating exemption status:', { 
      userId, 
      eventId, 
      checked 
    });
    
    try {
      // First, check if payment record exists
      const { data: existingPayment, error: checkError } = await supabase
        .from('pagamentos')
        .select('id, isento, valor, status')
        .eq('atleta_id', userId)
        .eq('evento_id', eventId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing payment record:', checkError);
        throw new Error('Erro ao verificar registro de pagamento');
      }

      console.log('Existing payment record:', existingPayment);

      // If payment record doesn't exist, we need to create one first
      if (!existingPayment) {
        console.log('Payment record not found, cannot update exemption status');
        throw new Error('Registro de pagamento não encontrado. O pagamento deve ser criado primeiro.');
      }

      // Update exemption status in pagamentos table
      const updateData: any = { 
        isento: checked,
        status: checked ? 'isento' : 'pendente', // Set status to "isento" when exempt, "pendente" when not
        valor: checked ? 0 : existingPayment.valor // Set value to 0 when exempt, restore original when not
      };

      console.log('Updating payment with data:', updateData);

      const { error: updateError } = await supabase
        .from('pagamentos')
        .update(updateData)
        .eq('atleta_id', userId)
        .eq('evento_id', eventId);

      if (updateError) {
        console.error('Error updating exemption in payments:', updateError);
        throw updateError;
      }

      console.log('Exemption updated successfully');

      setIsExempt(checked);
      await refetchPayment();
      
      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ 
        queryKey: ['athlete-management', eventId]
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['branch-analytics', eventId]
      });

      toast.success(checked ? 'Marcado como isento com sucesso!' : 'Isenção removida com sucesso!');
    } catch (error: any) {
      console.error('Error updating exemption:', error);
      toast.error('Erro ao atualizar status de isenção: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsUpdatingExemption(false);
    }
  };

  return {
    isExempt,
    isUpdatingExemption,
    handleExemptionChange
  };
};
