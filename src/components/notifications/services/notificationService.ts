
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
  console.log('=== MARK AS READ START ===');
  console.log('markNotificationAsRead called with:', { notificationId, userId });
  
  if (!notificationId || !userId) {
    console.error('Missing required parameters:', { notificationId, userId });
    throw new Error('notificationId e userId são obrigatórios');
  }
  
  try {
    // Verificar sessão do usuário autenticado
    console.log('=== CHECKING AUTH SESSION ===');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session exists:', !!session);
    console.log('Session user ID:', session?.user?.id);
    console.log('Session error:', sessionError);
    
    // Verificar dados do usuário autenticado
    console.log('=== CHECKING AUTH USER ===');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth user ID:', user?.id);
    console.log('Expected userId:', userId);
    console.log('IDs match:', user?.id === userId);
    console.log('Auth error:', authError);
    
    // Verificar se o usuário tem filial
    console.log('=== CHECKING USER BRANCH ===');
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('filial_id, nome_completo')
      .eq('id', userId)
      .single();
    
    console.log('User data:', userData);
    console.log('User error:', userError);
    
    // Verificar se a notificação existe
    console.log('=== CHECKING NOTIFICATION EXISTS ===');
    const { data: notificationData, error: notificationError } = await supabase
      .from('notificacoes')
      .select('id, titulo, autor_id, evento_id')
      .eq('id', notificationId)
      .single();
    
    console.log('Notification data:', notificationData);
    console.log('Notification error:', notificationError);
    
    // Verificar destinatários da notificação
    console.log('=== CHECKING NOTIFICATION DESTINATIONS ===');
    const { data: destinations, error: destError } = await supabase
      .from('notificacao_destinatarios')
      .select('*')
      .eq('notificacao_id', notificationId);
    
    console.log('Destinations:', destinations);
    console.log('Destinations error:', destError);
    console.log('User filial matches destination:', destinations?.some(d => 
      d.filial_id === null || d.filial_id === userData?.filial_id
    ));
    
    // Verificar se já existe um registro
    console.log('=== CHECKING EXISTING READ STATUS ===');
    const { data: existingRead, error: checkError } = await supabase
      .from('notificacao_leituras')
      .select('id, lido_em')
      .eq('notificacao_id', notificationId)
      .eq('usuario_id', userId)
      .maybeSingle();

    console.log('Existing read check result:', { existingRead, checkError });

    if (checkError) {
      console.error('Error checking existing read status:', checkError);
      throw checkError;
    }

    if (existingRead) {
      console.log('Notification already marked as read at:', existingRead.lido_em);
      return { success: true, message: 'Already read', data: existingRead };
    }

    // Tentar inserir o registro de leitura
    console.log('=== ATTEMPTING TO INSERT READ RECORD ===');
    const insertData = {
      notificacao_id: notificationId,
      usuario_id: userId,
      lido_em: new Date().toISOString()
    };
    console.log('Insert data:', insertData);
    
    const { data, error } = await supabase
      .from('notificacao_leituras')
      .insert(insertData)
      .select()
      .single();

    console.log('Insert result:', { data, error });

    if (error) {
      console.error('=== DATABASE ERROR DETAILS ===');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      
      // Tentar um select para verificar se o registro foi criado mesmo com erro
      console.log('=== CHECKING IF RECORD WAS CREATED DESPITE ERROR ===');
      const { data: checkData, error: checkErr } = await supabase
        .from('notificacao_leituras')
        .select('*')
        .eq('notificacao_id', notificationId)
        .eq('usuario_id', userId)
        .maybeSingle();
      
      console.log('Post-error check:', { checkData, checkErr });
      
      throw error;
    }

    console.log('=== SUCCESS ===');
    console.log('Notification marked as read successfully:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('=== CATCH ERROR ===');
    console.error('Error in markNotificationAsRead:', error);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    throw error;
  }
};
