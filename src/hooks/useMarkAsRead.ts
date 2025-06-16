
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markNotificationAsRead } from '@/components/notifications/services/notificationService';

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ notificationId, userId }: { notificationId: string; userId: string }) =>
      markNotificationAsRead(notificationId, userId),
    onSuccess: () => {
      // Invalidar queries de notificações para atualizar status
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
    }
  });
}
