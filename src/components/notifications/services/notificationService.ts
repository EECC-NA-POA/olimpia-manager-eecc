
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import type { NotificationAuthorType } from '@/types/notifications';

interface NotificationData {
  mensagem: string;
  eventId: string;
}

export const submitNotification = async (
  data: NotificationData,
  userId: string,
  tipoAutor: NotificationAuthorType
) => {
  const { mensagem, eventId } = data;

  console.log('Creating notification with data:', {
    mensagem,
    eventId,
    userId,
    tipoAutor
  });

  // Preparar dados da notificação seguindo o schema correto
  const notificationData = {
    evento_id: eventId,
    autor_id: userId,
    tipo_autor: tipoAutor,
    mensagem,
    visivel: true
    // autor_nome será preenchido automaticamente pelo trigger
  };

  console.log('Inserting notification:', notificationData);

  const { data: result, error } = await supabase
    .from('notificacoes')
    .insert(notificationData)
    .select();

  if (error) {
    console.error('Database error:', error);
    throw error;
  }

  console.log('Notification created successfully:', result);
  toast.success('Notificação criada com sucesso!');
};
