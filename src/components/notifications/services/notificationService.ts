
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import type { NotificationAuthorType, CreateNotificationData } from '@/types/notifications';

export const submitNotification = async (
  data: CreateNotificationData,
  userId: string,
  tipoAutor: NotificationAuthorType
) => {
  const { titulo, mensagem, eventId, destinatarios } = data;

  console.log('=== CREATING NOTIFICATION DEBUG ===');
  console.log('Input data:', { titulo, mensagem, eventId, userId, tipoAutor, destinatarios });

  try {
    // Primeiro, vamos verificar se o usuário existe
    console.log('1. Checking if user exists...');
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, nome_completo')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      throw new Error(`User not found: ${userError.message}`);
    }

    console.log('User found:', userData);

    // Verificar se o evento existe
    console.log('2. Checking if event exists...');
    const { data: eventData, error: eventError } = await supabase
      .from('eventos')
      .select('id, nome')
      .eq('id', eventId)
      .single();

    if (eventError) {
      console.error('Error fetching event:', eventError);
      throw new Error(`Event not found: ${eventError.message}`);
    }

    console.log('Event found:', eventData);

    // Preparar dados da notificação - INCLUINDO autor_nome manualmente para evitar trigger
    const notificationData = {
      evento_id: eventId,
      autor_id: userId,
      autor_nome: userData.nome_completo, // Incluir manualmente
      tipo_autor: tipoAutor,
      titulo,
      mensagem,
      visivel: true
    };

    console.log('3. Inserting notification with manual autor_nome:', notificationData);

    const { data: result, error } = await supabase
      .from('notificacoes')
      .insert(notificationData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting notification:', error);
      throw error;
    }

    console.log('4. Notification inserted successfully:', result);

    // Preparar os destinatários
    let destinatariosData: { notificacao_id: string; filial_id: string }[] = [];

    if (destinatarios.includes('all')) {
      console.log('5. Fetching all branches for "all" option');
      const { data: filiais, error: filiaisError } = await supabase
        .from('filiais')
        .select('id');

      if (filiaisError) {
        console.error('Error fetching branches:', filiaisError);
        // Limpar a notificação criada
        await supabase.from('notificacoes').delete().eq('id', result.id);
        throw filiaisError;
      }

      console.log('Fetched branches:', filiais);

      destinatariosData = filiais.map(filial => ({
        notificacao_id: result.id,
        filial_id: filial.id
      }));
    } else {
      console.log('5. Using specific branches:', destinatarios);
      destinatariosData = destinatarios.map(filialId => ({
        notificacao_id: result.id,
        filial_id: filialId
      }));
    }

    console.log('6. Inserting destinations:', destinatariosData);

    const { error: destError } = await supabase
      .from('notificacao_destinatarios')
      .insert(destinatariosData);

    if (destError) {
      console.error('Error inserting destinations:', destError);
      // Limpar a notificação criada
      await supabase.from('notificacoes').delete().eq('id', result.id);
      throw destError;
    }

    console.log('7. SUCCESS - Notification created completely');
    toast.success('Notificação criada com sucesso!');
    
  } catch (error) {
    console.error('=== NOTIFICATION CREATION FAILED ===');
    console.error('Error details:', error);
    throw error;
  }
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
