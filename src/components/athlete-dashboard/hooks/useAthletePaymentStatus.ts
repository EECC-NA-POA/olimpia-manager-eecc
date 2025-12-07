import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AthletePaymentStatus {
  status_pagamento: string | null;
  valor_taxa: number | null;
  isento: boolean;
  taxa_inscricao_id: number | null;
  comprovante_url: string | null;
  link_formulario: string | null;
  pix_key: string | null;
  qr_code_image: string | null;
  contato_nome: string | null;
  contato_telefone: string | null;
}

export function useAthletePaymentStatus(userId: string | undefined, eventId: string | null) {
  return useQuery({
    queryKey: ['athlete-payment-status', userId, eventId],
    queryFn: async (): Promise<AthletePaymentStatus | null> => {
      if (!userId || !eventId) return null;

      console.log('Fetching payment status for athlete:', userId, 'event:', eventId);

      // First, get the user's registration to find their taxa_inscricao_id
      const { data: registration, error: regError } = await supabase
        .from('inscricoes_eventos')
        .select(`
          id,
          taxa_inscricao_id,
          taxas_inscricao:taxas_inscricao!fk_inscricoes_eventos_taxa_inscricao (
            id,
            valor,
            isento,
            link_formulario,
            pix_key,
            qr_code_image,
            contato_nome,
            contato_telefone
          )
        `)
        .eq('usuario_id', userId)
        .eq('evento_id', eventId)
        .maybeSingle();

      if (regError) {
        console.error('Error fetching registration:', regError);
        throw regError;
      }

      if (!registration) {
        console.log('No registration found');
        return null;
      }

      // Get payment status from pagamentos table
      const { data: payment, error: payError } = await supabase
        .from('pagamentos')
        .select('status, valor, isento, comprovante_url')
        .eq('atleta_id', userId)
        .eq('evento_id', eventId)
        .maybeSingle();

      if (payError) {
        console.error('Error fetching payment:', payError);
        // Don't throw - payment record might not exist yet
      }

      const taxaInfo = registration.taxas_inscricao as any;
      const isento = payment?.isento || taxaInfo?.isento || false;
      
      const result: AthletePaymentStatus = {
        status_pagamento: isento ? 'isento' : (payment?.status || 'pendente'),
        valor_taxa: taxaInfo?.valor || null,
        isento,
        taxa_inscricao_id: registration.taxa_inscricao_id,
        comprovante_url: payment?.comprovante_url || null,
        link_formulario: taxaInfo?.link_formulario || null,
        pix_key: taxaInfo?.pix_key || null,
        qr_code_image: taxaInfo?.qr_code_image || null,
        contato_nome: taxaInfo?.contato_nome || null,
        contato_telefone: taxaInfo?.contato_telefone || null
      };

      console.log('Payment status:', result);
      return result;
    },
    enabled: !!userId && !!eventId,
  });
}
