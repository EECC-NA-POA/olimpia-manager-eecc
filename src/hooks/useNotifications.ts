
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types/notifications';

interface UseNotificationsProps {
  eventId: string | null;
  userId?: string;
  includeAuthoredHidden?: boolean; // Novo parâmetro para controlar se inclui notificações ocultas do autor
}

export function useNotifications({ eventId, userId, includeAuthoredHidden = false }: UseNotificationsProps) {
  return useQuery({
    queryKey: ['notifications', eventId, userId, includeAuthoredHidden],
    queryFn: async () => {
      if (!eventId || !userId) {
        console.log('No eventId or userId provided for notifications');
        return [];
      }

      console.log('Fetching notifications for:', { eventId, userId, includeAuthoredHidden });

      try {
        // Buscar filial do usuário
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('filial_id')
          .eq('id', userId)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          throw userError;
        }

        console.log('User data:', userData);

        // Buscar modalidades em que o usuário está inscrito no evento
        const { data: userModalities } = await supabase
          .from('inscricoes_modalidades')
          .select('modalidade_id')
          .eq('atleta_id', userId)
          .eq('evento_id', eventId);

        const userModIds = userModalities?.map(m => m.modalidade_id) || [];
        console.log('User modalities:', userModIds);

        // Consulta 1: Notificações destinadas à filial do usuário (APENAS VISÍVEIS) ou a todas as filiais (is null)
        console.log('Executing destined notifications query...');
        const { data: rawDestinedNotifications, error: destinedError } = await supabase
          .from('notificacoes')
          .select(`
            id,
            evento_id,
            autor_id,
            autor_nome,
            tipo_autor,
            titulo,
            mensagem,
            visivel,
            criado_em,
            atualizado_em,
            notificacao_destinatarios(filial_id, modalidade_id)
          `)
          .eq('evento_id', eventId)
          .eq('visivel', true) // FILTRO IMPORTANTE: apenas notificações visíveis
          .order('criado_em', { ascending: false });

        let destinedNotifications: any[] = [];
        if (rawDestinedNotifications) {
          destinedNotifications = rawDestinedNotifications.filter(notification => {
            // Verifica se a notificação possui destinatários
            if (!notification.notificacao_destinatarios || notification.notificacao_destinatarios.length === 0) {
              return false;
            }
            // Retorna verdadeiro se tiver um destinatário com filial_id NULO (Todos),
            // ou filial igual a do usuário, ou modalidade na qual o usuário está inscrito
            return notification.notificacao_destinatarios.some(
              (dest: any) =>
                dest.filial_id === null ||
                dest.filial_id === userData.filial_id ||
                (dest.modalidade_id && userModIds.includes(dest.modalidade_id))
            );
          });
        }

        console.log('Destined notifications result:', { destinedNotifications, destinedError });

        // Consulta 2: Notificações criadas pelo próprio usuário
        console.log('Executing authored notifications query...');
        let authoredNotificationsQuery = supabase
          .from('notificacoes')
          .select(`
            id,
            evento_id,
            autor_id,
            autor_nome,
            tipo_autor,
            titulo,
            mensagem,
            visivel,
            criado_em,
            atualizado_em
          `)
          .eq('evento_id', eventId)
          .eq('autor_id', userId);

        // Se não deve incluir notificações ocultas do autor, filtrar apenas as visíveis
        if (!includeAuthoredHidden) {
          authoredNotificationsQuery = authoredNotificationsQuery.eq('visivel', true);
        }

        const { data: authoredNotifications, error: authoredError } = await authoredNotificationsQuery
          .order('criado_em', { ascending: false });

        console.log('Authored notifications result:', { authoredNotifications, authoredError });

        if (destinedError) {
          console.error('Error fetching destined notifications:', destinedError);
          throw destinedError;
        }

        if (authoredError) {
          console.error('Error fetching authored notifications:', authoredError);
          throw authoredError;
        }

        // Combinar notificações destinadas (apenas visíveis) + notificações do autor (conforme parâmetro)
        let allNotifications: any[] = [];

        // Incluir notificações destinadas (sempre apenas visíveis)
        if (destinedNotifications) {
          allNotifications = [...destinedNotifications];
        }

        // Incluir notificações criadas pelo próprio usuário (visíveis ou todas, conforme parâmetro)
        if (authoredNotifications) {
          allNotifications = [...allNotifications, ...authoredNotifications];
        }

        console.log('All notifications before deduplication:', allNotifications);

        const uniqueNotifications = allNotifications.filter((notification, index, self) =>
          index === self.findIndex(n => n.id === notification.id)
        );

        if (uniqueNotifications.length === 0) {
          console.log('No notifications found, returning empty array');
          return [];
        }

        // Buscar exclusões do usuário para essas notificações
        const notificationIds = uniqueNotifications.map(n => n.id);
        let excludedIds: string[] = [];

        const { data: excluded, error: excludedError } = await supabase
          .from('notificacoes_excluidas')
          .select('notificacao_id')
          .eq('usuario_id', userId)
          .in('notificacao_id', notificationIds);

        if (!excludedError && excluded) {
          excludedIds = excluded.map(e => e.notificacao_id);
        }

        // Remove as que foram excluídas (apagadas via swipe)
        const visibleUniqueNotifications = uniqueNotifications.filter(n => !excludedIds.includes(n.id));

        console.log('Notifications from database - destined:', destinedNotifications?.length || 0);
        console.log('Notifications from database - authored:', authoredNotifications?.length || 0);
        console.log('Unique notifications after merge:', visibleUniqueNotifications.length);

        if (visibleUniqueNotifications.length === 0) {
          return [];
        }



        // Buscar leituras do usuário para essas notificações
        const visibleNotificationIds = visibleUniqueNotifications.map(n => n.id);

        let readNotifications: string[] = [];
        if (visibleNotificationIds.length > 0) {
          const { data: reads, error: readsError } = await supabase
            .from('notificacao_leituras')
            .select('notificacao_id')
            .eq('usuario_id', userId)
            .in('notificacao_id', visibleNotificationIds);

          if (!readsError && reads) {
            readNotifications = reads.map(r => r.notificacao_id);
          }
        }

        // Transformar dados para incluir campo 'lida'
        const notifications: Notification[] = visibleUniqueNotifications.map((item: any) => ({
          id: item.id,
          evento_id: item.evento_id,
          autor_id: item.autor_id,
          autor_nome: item.autor_nome || 'Usuário desconhecido',
          tipo_autor: item.tipo_autor,
          titulo: item.titulo,
          mensagem: item.mensagem,
          visivel: item.visivel,
          criado_em: item.criado_em,
          atualizado_em: item.atualizado_em,
          lida: readNotifications.includes(item.id)
        }));

        // Ordenar por data de criação (mais recente primeiro)
        notifications.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());

        console.log('Final processed notifications:', notifications);
        return notifications;

      } catch (error) {
        console.error('Error in useNotifications:', error);
        throw error;
      }
    },
    enabled: !!eventId && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
}
