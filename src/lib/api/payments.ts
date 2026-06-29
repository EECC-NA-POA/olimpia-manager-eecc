
import { supabase } from '../supabase';

export const updatePaymentAmount = async (
  athleteId: string,
  amount: number,
  eventId: string
): Promise<void> => {
  const { error } = await supabase
    .from('pagamentos')
    .update({ valor: amount })
    .eq('atleta_id', athleteId)
    .eq('evento_id', eventId);

  if (error) {
    console.error('Error updating payment amount:', error);
    throw new Error(error.message);
  }
};

export const updatePaymentStatus = async (
  athleteId: string,
  status: string,
  eventId: string
): Promise<void> => {
  const { error } = await supabase
    .rpc('atualizar_status_pagamento', {
      p_atleta_id: athleteId,
      p_novo_status: status,
      p_evento_id: eventId,
    });

  if (error) {
    console.error('Error updating payment status:', error);
    throw new Error(error.message);
  }
};
