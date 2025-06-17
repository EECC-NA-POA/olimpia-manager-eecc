
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markNotificationAsRead } from '@/components/notifications/services/notificationService';

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ notificationId, userId }: { notificationId: string; userId: string }) => {
      console.log('useMarkAsRead mutation called with:', { notificationId, userId });
      return markNotificationAsRead(notificationId, userId);
    },
    onSuccess: (data, variables) => {
      console.log('Notification marked as read successfully', variables, data);
      
      // Invalidar queries de notificações para atualizar status
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Também invalidar query específica se existir
      queryClient.invalidateQueries({ 
        queryKey: ['notifications', variables.notificationId] 
      });
    },
    onError: (error, variables) => {
      console.error('Error marking notification as read:', error, variables);
    }
  });
}
