
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
}

export type NotificationAuthorType = 'organizador' | 'representante_delegacao';
