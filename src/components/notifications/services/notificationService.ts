
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
    
    if (!session || !session.user) {
      console.error('No authenticated session found');
      throw new Error('Usuário não autenticado');
    }
    
    if (session.user.id !== userId) {
      console.error('Session user ID does not match provided userId:', { sessionUserId: session.user.id, providedUserId: userId });
      throw new Error('ID do usuário não confere com a sessão');
    }
    
    // Verificar dados do usuário autenticado
    console.log('=== CHECKING USER DATA ===');
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('filial_id, nome_completo')
      .eq('id', userId)
      .single();
    
    console.log('User data:', userData);
    console.log('User error:', userError);
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      throw new Error('Erro ao buscar dados do usuário');
    }
    
    // Verificar se a notificação existe e suas destinações
    console.log('=== CHECKING NOTIFICATION AND DESTINATIONS ===');
    const { data: notificationWithDestinations, error: notifError } = await supabase
      .from('notificacoes')
      .select(`
        id, 
        titulo, 
        autor_id, 
        evento_id,
        notificacao_destinatarios (
          filial_id
        )
      `)
      .eq('id', notificationId)
      .single();
    
    console.log('Notification with destinations:', notificationWithDestinations);
    console.log('Notification error:', notifError);
    
    if (notifError) {
      console.error('Error fetching notification:', notifError);
      throw new Error('Erro ao buscar notificação');
    }
    
    // Verificar se o usuário pode acessar esta notificação
    const destinations = notificationWithDestinations.notificacao_destinatarios;
    const userCanAccess = destinations.some(dest => 
      dest.filial_id === null || dest.filial_id === userData.filial_id
    );
    
    console.log('User can access notification:', userCanAccess);
    console.log('User filial_id:', userData.filial_id);
    console.log('Notification destinations:', destinations);
    
    if (!userCanAccess) {
      console.error('User does not have access to this notification');
      throw new Error('Usuário não tem acesso a esta notificação');
    }
    
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
    
    // Verificar se as permissões estão corretas antes da inserção
    console.log('=== TESTING RLS PERMISSIONS ===');
    const { error: insertError } = await supabase
      .from('notificacao_leituras')
      .insert(insertData);

    console.log('Insert result:', { insertError });

    if (insertError) {
      console.error('=== DATABASE INSERT ERROR ===');
      console.error('Error code:', insertError.code);
      console.error('Error message:', insertError.message);
      console.error('Error details:', insertError.details);
      console.error('Error hint:', insertError.hint);
      
      // Análise específica do erro
      if (insertError.code === '42501') {
        console.error('RLS PERMISSION DENIED - The RLS policy is blocking the insert');
      } else if (insertError.message?.includes('duplicate key')) {
        console.error('DUPLICATE KEY - Record already exists');
      } else if (insertError.message?.includes('violates foreign key')) {
        console.error('FOREIGN KEY VIOLATION - Referenced record does not exist');
      }
      
      throw insertError;
    }

    // Se chegou até aqui, a inserção foi bem-sucedida
    console.log('=== INSERT SUCCESSFUL ===');
    
    // Tentar buscar o registro recém-criado para confirmar
    const { data: newReadRecord, error: selectError } = await supabase
      .from('notificacao_leituras')
      .select('*')
      .eq('notificacao_id', notificationId)
      .eq('usuario_id', userId)
      .maybeSingle();
    
    console.log('Newly created record check:', { newReadRecord, selectError });

    console.log('=== SUCCESS ===');
    console.log('Notification marked as read successfully');
    return { success: true, data: newReadRecord };
    
  } catch (error) {
    console.error('=== CATCH ERROR ===');
    console.error('Error in markNotificationAsRead:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    throw error;
  }
};
