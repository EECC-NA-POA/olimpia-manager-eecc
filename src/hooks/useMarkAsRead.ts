
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markNotificationAsRead } from '@/components/notifications/services/notificationService';

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ notificationId, userId }: { notificationId: string; userId: string }) => {
      console.log('=== MUTATION START ===');
      console.log('useMarkAsRead mutation called with:', { notificationId, userId });
      console.log('Current timestamp:', new Date().toISOString());
      return markNotificationAsRead(notificationId, userId);
    },
    onSuccess: (data, variables) => {
      console.log('=== MUTATION SUCCESS ===');
      console.log('Notification marked as read successfully', variables, data);
      
      // Invalidar queries de notificações para atualizar status
      console.log('Invalidating notifications queries...');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Também invalidar query específica se existir
      queryClient.invalidateQueries({ 
        queryKey: ['notifications', variables.notificationId] 
      });
      
      console.log('Queries invalidated successfully');
    },
    onError: (error, variables) => {
      console.error('=== MUTATION ERROR ===');
      console.error('Error marking notification as read:', error, variables);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error.constructor.name);
    }
  });
}
