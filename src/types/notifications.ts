
export interface Notification {
  id: string;
  evento_id: string;
  autor_id: string;
  autor_nome: string;
  tipo_autor: 'organizador' | 'representante_delegacao';
  mensagem: string;
  visivel: boolean;
  criado_em: string;
  atualizado_em: string;
  lida?: boolean; // Campo calculado via JOIN com notificacao_leituras
}

export interface NotificationDestination {
  notificacao_id: string;
  filial_id: string | null; // null = todas as filiais
}

export interface NotificationReading {
  id: string;
  notificacao_id: string;
  usuario_id: string;
  lido_em: string;
}

export type NotificationAuthorType = 'organizador' | 'representante_delegacao';

export interface CreateNotificationData {
  mensagem: string;
  eventId: string;
  destinatarios: string[]; // Array de filial_ids, ou ['all'] para todas
}
