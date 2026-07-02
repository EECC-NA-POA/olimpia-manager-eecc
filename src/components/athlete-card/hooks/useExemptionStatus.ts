
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ExemptionInfo {
  isento_por: string | null;
  isento_em: string | null;
  isento_justificativa: string | null;
  isento_por_nome: string | null;
}

interface UseExemptionStatusProps {
  userId: string;
  eventId: string;
  canManage: boolean;
  refetchPayment: () => Promise<any>;
}

export const useExemptionStatus = ({
  userId,
  eventId,
  canManage,
  refetchPayment
}: UseExemptionStatusProps) => {
  const [isExempt, setIsExempt] = useState(false);
  const [isUpdatingExemption, setIsUpdatingExemption] = useState(false);
  const [exemptionInfo, setExemptionInfo] = useState<ExemptionInfo | null>(null);
  const queryClient = useQueryClient();

  // Lê o estado de isenção (só para quem gerencia)
  useEffect(() => {
    const checkExemptionStatus = async () => {
      if (!canManage) return;

      try {
        const { data, error } = await supabase
          .from('pagamentos')
          .select('isento, status, isento_por, isento_em, isento_justificativa')
          .eq('atleta_id', userId)
          .eq('evento_id', eventId)
          .single();

        if (error) {
          setIsExempt(false);
          setExemptionInfo(null);
          return;
        }

        const exempt = !!data?.isento || data?.status === 'isento';
        setIsExempt(exempt);

        if (exempt && data?.isento_por) {
          const { data: grantor } = await supabase
            .from('usuarios')
            .select('nome_completo')
            .eq('id', data.isento_por)
            .single();
          setExemptionInfo({
            isento_por: data.isento_por,
            isento_em: data.isento_em,
            isento_justificativa: data.isento_justificativa,
            isento_por_nome: grantor?.nome_completo ?? null,
          });
        } else {
          setExemptionInfo(null);
        }
      } catch (error) {
        console.error('Error in checkExemptionStatus:', error);
        setIsExempt(false);
        setExemptionInfo(null);
      }
    };

    checkExemptionStatus();
  }, [canManage, userId, eventId]);

  const handleExemptionChange = async (checked: boolean, justificativa?: string) => {
    if (!canManage) return;

    setIsUpdatingExemption(true);
    try {
      const { error } = await supabase.rpc('conceder_isencao', {
        p_atleta_id: userId,
        p_evento_id: eventId,
        p_isento: checked,
        p_justificativa: justificativa ?? null,
      });

      if (error) {
        console.error('Error updating exemption via RPC:', error);
        throw new Error(error.message);
      }

      setIsExempt(checked);
      await refetchPayment();

      await queryClient.invalidateQueries({ queryKey: ['athlete-management', eventId] });
      await queryClient.invalidateQueries({ queryKey: ['branch-analytics', eventId] });

      toast.success(checked ? 'Atleta marcado como isento!' : 'Isenção removida com sucesso!');
    } catch (error: any) {
      console.error('Error updating exemption:', error);
      toast.error('Erro ao atualizar isenção: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsUpdatingExemption(false);
    }
  };

  return {
    isExempt,
    isUpdatingExemption,
    exemptionInfo,
    handleExemptionChange
  };
};
