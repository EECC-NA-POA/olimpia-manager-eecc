
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
      if (!eventId) {
        console.log('No eventId provided for notifications');
        return [];
      }

      console.log('Fetching notifications for:', { eventId, userId });

      try {
        const { data, error } = await supabase
          .from('notificacoes')
          .select(`
            id,
            evento_id,
            autor_id,
            autor_nome,
            tipo_autor,
            mensagem,
            visivel,
            criado_em,
            atualizado_em
          `)
          .eq('evento_id', eventId)
          .eq('visivel', true)
          .order('criado_em', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          throw error;
        }

        console.log('Notifications from database:', data);

        if (!data) return [];

        // Transform to match our Notification type
        const notifications: Notification[] = data.map((item: any) => ({
          id: item.id,
          evento_id: item.evento_id,
          autor_id: item.autor_id,
          autor_nome: item.autor_nome,
          tipo_autor: item.tipo_autor,
          mensagem: item.mensagem,
          visivel: item.visivel,
          criado_em: item.criado_em,
          atualizado_em: item.atualizado_em
        }));

        console.log('Final processed notifications:', notifications);
        return notifications;

      } catch (error) {
        console.error('Error in useNotifications:', error);
        throw error;
      }
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
}
