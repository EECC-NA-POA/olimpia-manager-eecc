import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AthletePaymentStatus {
  status_pagamento: string | null;
  valor_taxa: number | null;
}

export function useAthletePaymentStatus(userId: string | undefined, eventId: string | null) {
  return useQuery({
    queryKey: ['athlete-payment-status', userId, eventId],
    queryFn: async (): Promise<AthletePaymentStatus | null> => {
      if (!userId || !eventId) return null;

      console.log('Fetching payment status for athlete:', userId, 'event:', eventId);

      const { data, error } = await supabase
        .from('inscricoes_eventos')
        .select('status_pagamento, valor_taxa')
        .eq('usuario_id', userId)
        .eq('evento_id', eventId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching payment status:', error);
        throw error;
      }

      console.log('Payment status:', data);
      return data;
    },
    enabled: !!userId && !!eventId,
  });
}
