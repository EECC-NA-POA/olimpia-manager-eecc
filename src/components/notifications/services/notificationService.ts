
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import type { NotificationAuthorType, CreateNotificationData } from '@/types/notifications';

export const submitNotification = async (
  data: CreateNotificationData,
  userId: string,
  tipoAutor: NotificationAuthorType
) => {
  const { titulo, mensagem, eventId, destinatarios } = data;

  console.log('Creating notification with data:', {
    titulo,
    mensagem,
    eventId,
    userId,
    tipoAutor,
    destinatarios
  });

  // 1. Inserir a notificação
  const notificationData = {
    evento_id: eventId,
    autor_id: userId,
    tipo_autor: tipoAutor,
    titulo,
    mensagem,
    visivel: true
  };

  const { data: result, error } = await supabase
    .from('notificacoes')
    .insert(notificationData)
    .select()
    .single();

  if (error) {
    console.error('Database error:', error);
    throw error;
  }

  // 2. Inserir os destinatários
  const destinatariosData = destinatarios.map(filialId => ({
    notificacao_id: result.id,
    filial_id: filialId === 'all' ? null : filialId
  }));

  const { error: destError } = await supabase
    .from('notificacao_destinatarios')
    .insert(destinatariosData);

  if (destError) {
    console.error('Error inserting destinations:', destError);
    // Tentar limpar a notificação criada
    await supabase.from('notificacoes').delete().eq('id', result.id);
    throw destError;
  }

  console.log('Notification created successfully:', result);
  toast.success('Notificação criada com sucesso!');
};

export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  const { error } = await supabase
    .from('notificacao_leituras')
    .insert({
      notificacao_id: notificationId,
      usuario_id: userId
    });

  if (error && error.code !== '23505') { // Ignorar erro de duplicata
    console.error('Error marking notification as read:', error);
    throw error;
  }
};
