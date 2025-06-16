
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markNotificationAsRead } from '@/components/notifications/services/notificationService';

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ notificationId, userId }: { notificationId: string; userId: string }) => {
      console.log('useMarkAsRead mutation called with:', { notificationId, userId });
      return markNotificationAsRead(notificationId, userId);
    },
    onSuccess: () => {
      console.log('Notification marked as read successfully');
      // Invalidar queries de notificações para atualizar status
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
    }
  });
}
