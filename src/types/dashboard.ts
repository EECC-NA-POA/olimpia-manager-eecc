
export interface EventSummary {
  id: string;
  nome: string;
  descricao: string | null;
  data_inicio_inscricao: string | null;
  data_fim_inscricao: string | null;
  data_inicio_evento: string | null;
  data_fim_evento: string | null;
  cidade: string | null;
  estado: string | null;
  pais: string | null;
  status_evento: 'ativo' | 'encerrado' | 'suspenso' | 'em_teste';
}

export interface EnrollmentSummary {
  totalEnrolled: number;
  totalPending: number;
  totalConfirmed: number;
  pendingPaymentAmount: number;
  generalStatus: 'ok' | 'pending' | 'attention';
}

export type EnrollmentStatus = 'pendente' | 'confirmada' | 'cancelada';
export type PaymentStatus = 'pendente' | 'pago' | 'isento' | 'rejeitado';
