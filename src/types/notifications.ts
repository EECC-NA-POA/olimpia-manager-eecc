
export interface Notification {
  id: number;
  titulo: string;
  conteudo: string;
  tipo_destinatario: 'todos' | 'perfil' | 'filial' | 'individual';
  perfil_id?: number;
  filial_id?: number;
  evento_id: string;
  ativa: boolean;
  data_criacao: string;
  data_expiracao?: string;
  lida: boolean;
  usuario_id?: string;
}

export type NotificationTargetType = 'todos' | 'perfil' | 'filial' | 'individual';
