
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types/notifications';

interface UseNotificationsProps {
  eventId: string | null;
  userId?: string;
}

export function useNotifications({ eventId, userId }: UseNotificationsProps) {
  return useQuery({
    queryKey: ['notifications', eventId, userId],
    queryFn: async () => {
      if (!eventId || !userId) {
        console.log('No eventId or userId provided for notifications');
        return [];
      }

      console.log('Fetching notifications for:', { eventId, userId });

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

        // Consulta principal para notificações segmentadas
        const { data, error } = await supabase
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
            notificacao_destinatarios!inner(filial_id)
          `)
          .eq('evento_id', eventId)
          .eq('visivel', true)
          .eq('notificacao_destinatarios.filial_id', userData.filial_id)
          .order('criado_em', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          throw error;
        }

        console.log('Notifications from database:', data);

        if (!data) return [];

        // Buscar leituras do usuário para essas notificações
        const notificationIds = data.map(n => n.id);
        
        let readNotifications: string[] = [];
        if (notificationIds.length > 0) {
          const { data: reads, error: readsError } = await supabase
            .from('notificacao_leituras')
            .select('notificacao_id')
            .eq('usuario_id', userId)
            .in('notificacao_id', notificationIds);

          if (!readsError && reads) {
            readNotifications = reads.map(r => r.notificacao_id);
          }
        }

        // Transformar dados para incluir campo 'lida'
        const notifications: Notification[] = data.map((item: any) => ({
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
