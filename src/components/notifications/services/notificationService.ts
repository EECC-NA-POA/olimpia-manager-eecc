
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

  try {
    // 1. Inserir a notificação (o trigger preencherá automaticamente o autor_nome)
    const notificationData = {
      evento_id: eventId,
      autor_id: userId,
      tipo_autor: tipoAutor,
      titulo,
      mensagem,
      visivel: true
    };

    console.log('Inserting notification with data:', notificationData);

    const { data: result, error } = await supabase
      .from('notificacoes')
      .insert(notificationData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting notification:', error);
      throw error;
    }

    console.log('Notification inserted successfully:', result);

    // 2. Preparar os destinatários
    let destinatariosData: { notificacao_id: string; filial_id: string }[] = [];

    if (destinatarios.includes('all')) {
      console.log('Fetching all branches for "all" option');
      // Se for "todas as filiais", buscar todas as filiais
      const { data: filiais, error: filiaisError } = await supabase
        .from('filiais')
        .select('id');

      if (filiaisError) {
        console.error('Error fetching branches:', filiaisError);
        // Tentar limpar a notificação criada
        await supabase.from('notificacoes').delete().eq('id', result.id);
        throw filiaisError;
      }

      console.log('Fetched branches:', filiais);

      destinatariosData = filiais.map(filial => ({
        notificacao_id: result.id,
        filial_id: filial.id
      }));
    } else {
      console.log('Using specific branches:', destinatarios);
      // Se for filiais específicas
      destinatariosData = destinatarios.map(filialId => ({
        notificacao_id: result.id,
        filial_id: filialId
      }));
    }

    console.log('Inserting destinations:', destinatariosData);

    const { error: destError } = await supabase
      .from('notificacao_destinatarios')
      .insert(destinatariosData);

    if (destError) {
      console.error('Error inserting destinations:', destError);
      // Tentar limpar a notificação criada
      await supabase.from('notificacoes').delete().eq('id', result.id);
      throw destError;
    }

    console.log('Destinations inserted successfully');
    console.log('Notification created successfully:', result);
    toast.success('Notificação criada com sucesso!');
    
  } catch (error) {
    console.error('Full error in submitNotification:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  console.log('markNotificationAsRead called with:', { notificationId, userId });
  
  if (!notificationId || !userId) {
    console.error('Missing required parameters:', { notificationId, userId });
    throw new Error('notificationId e userId são obrigatórios');
  }
  
  try {
    console.log('Attempting to insert into notificacao_leituras...');
    
    const { data, error } = await supabase
      .from('notificacao_leituras')
      .insert({
        notificacao_id: notificationId,
        usuario_id: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Database error details:', error);
      
      // Se for erro de duplicata (código 23505), ignorar pois significa que já foi lida
      if (error.code === '23505') {
        console.log('Notification already marked as read - duplicate key error');
        return { success: true, message: 'Already read' };
      }
      
      console.error('Error marking notification as read:', error);
      throw error;
    }

    console.log('Notification marked as read successfully:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    throw error;
  }
};
