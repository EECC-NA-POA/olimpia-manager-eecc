import { supabase } from '@/lib/supabase';

export interface PaymentRecord {
    id: number;
    atleta_id: string;
    evento_id: string;
    status: 'pendente' | 'aprovado' | 'rejeitado' | 'confirmado' | null;
    comprovante_url: string | null;
    valor: number;
    data_criacao: string;
    taxa_inscricao_id: number;
}

/**
 * Get payment record for an event
 */
export async function getEventPayment(userId: string, eventId: string): Promise<PaymentRecord | null> {
    const { data, error } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('atleta_id', userId)
        .eq('evento_id', eventId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching event payment:', error);
        return null;
    }

    return data;
}

/**
 * Submit a payment proof for an event
 * Creates a new payment record or updates an existing one
 */
export async function submitEventPayment(
    userId: string,
    eventId: string,
    proofUrl: string
): Promise<PaymentRecord> {
    // 1. Check if payment exists
    const existingPayment = await getEventPayment(userId, eventId);

    if (existingPayment) {
        // Update existing
        const { data, error } = await supabase
            .from('pagamentos')
            .update({
                comprovante_url: proofUrl,
                status: 'pendente', // Reset status to pending on new upload
                data_criacao: new Date().toISOString(), // Update timestamp? Maybe keep original creation
            })
            .eq('id', existingPayment.id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update payment: ${error.message}`);
        return data;
    } else {
        // Create new
        // First, need to get taxa_inscricao_id from inscricoes_eventos
        // Assuming the user is already enrolled in the event (at least generically)
        const { data: enrollment, error: enrollmentError } = await supabase
            .from('inscricoes_eventos')
            .select('taxa_inscricao_id, taxas_inscricao(valor)')
            .eq('usuario_id', userId)
            .eq('evento_id', eventId)
            .maybeSingle();

        if (enrollmentError || !enrollment) {
            console.error('Error fetching enrollment for fee:', enrollmentError);
            throw new Error('Você precisa se inscrever no evento antes de enviar o pagamento.');
        }

        const taxaId = enrollment.taxa_inscricao_id;
        const taxaInfo = enrollment.taxas_inscricao as any;
        const valor = Array.isArray(taxaInfo) ? taxaInfo[0]?.valor : taxaInfo?.valor || 0;
        const identifier = `PAY-${userId.slice(0, 4)}-${Date.now().toString().slice(-6)}`;

        const { data, error } = await supabase
            .from('pagamentos')
            .insert({
                atleta_id: userId,
                evento_id: eventId,
                taxa_inscricao_id: taxaId,
                valor: valor,
                comprovante_url: proofUrl,
                status: 'pendente',
                numero_identificador: identifier,
                data_criacao: new Date().toISOString(),
                isento: false
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create payment: ${error.message}`);
        return data;
    }
}
