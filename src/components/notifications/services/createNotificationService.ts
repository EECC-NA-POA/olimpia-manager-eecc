
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

    // 2. Preparar os destinatários - SEMPRE criar registros em notificacao_destinatarios
    let destinatariosData: { notificacao_id: string; filial_id: string | null }[] = [];

    if (destinatarios.includes('all')) {
      console.log('Creating destination record for all branches (filial_id = null)');
      // Para "todas as filiais", criar um registro com filial_id = null
      destinatariosData = [{
        notificacao_id: result.id,
        filial_id: null
      }];
    } else {
      console.log('Using specific branches:', destinatarios);
      // Para filiais específicas
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
