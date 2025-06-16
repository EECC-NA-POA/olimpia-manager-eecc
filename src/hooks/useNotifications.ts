
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types/notifications';

interface UseNotificationsProps {
  eventId: string | null;
  userId?: string;
  userProfiles?: Array<{ id?: number; codigo: string; nome: string; }>;
}

export function useNotifications({ eventId, userId, userProfiles }: UseNotificationsProps) {
  return useQuery({
    queryKey: ['notifications', eventId, userId],
    queryFn: async () => {
      if (!eventId) {
        console.log('No eventId provided for notifications');
        return [];
      }

      console.log('Fetching notifications for:', { eventId, userId, userProfiles });

      try {
        let query = supabase
          .from('notificacoes')
          .select(`
            id,
            titulo,
            conteudo,
            tipo_destinatario,
            perfil_id,
            filial_id,
            evento_id,
            ativa,
            data_criacao,
            data_expiracao,
            lida,
            usuario_id
          `)
          .eq('evento_id', eventId)
          .eq('ativa', true)
          .order('data_criacao', { ascending: false });

        // Filter by current date if there's an expiration date
        query = query.or('data_expiracao.is.null,data_expiracao.gte.' + new Date().toISOString());

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching notifications:', error);
          throw error;
        }

        console.log('Raw notifications from database:', data);

        if (!data) return [];

        // Filter notifications based on user criteria
        const filteredNotifications = data.filter((notification: any) => {
          // If it's a general notification (tipo_destinatario = 'todos')
          if (notification.tipo_destinatario === 'todos') {
            return true;
          }

          // If it's targeted by profile type
          if (notification.tipo_destinatario === 'perfil' && notification.perfil_id && userProfiles) {
            return userProfiles.some(profile => profile.id === notification.perfil_id);
          }

          // If it's targeted by branch (assuming user has filial_id)
          if (notification.tipo_destinatario === 'filial' && notification.filial_id) {
            // This would need user's branch ID - we'd need to pass it as parameter
            return false; // For now, disable branch filtering
          }

          // If it's a personal notification
          if (notification.tipo_destinatario === 'individual' && notification.usuario_id === userId) {
            return true;
          }

          return false;
        });

        console.log('Filtered notifications:', filteredNotifications);

        // Transform to match our Notification type
        const notifications: Notification[] = filteredNotifications.map((item: any) => ({
          id: item.id,
          titulo: item.titulo,
          conteudo: item.conteudo,
          tipo_destinatario: item.tipo_destinatario,
          perfil_id: item.perfil_id,
          filial_id: item.filial_id,
          evento_id: item.evento_id,
          ativa: item.ativa,
          data_criacao: item.data_criacao,
          data_expiracao: item.data_expiracao,
          lida: item.lida || false,
          usuario_id: item.usuario_id
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
