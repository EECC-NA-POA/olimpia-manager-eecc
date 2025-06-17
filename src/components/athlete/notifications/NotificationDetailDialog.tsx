
import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMarkAsRead } from '@/hooks/useMarkAsRead';
import type { Notification } from '@/types/notifications';

interface NotificationDetailDialogProps {
  notification: Notification | null;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDetailDialog({ 
  notification, 
  userId, 
  isOpen, 
  onClose 
}: NotificationDetailDialogProps) {
  const markAsReadMutation = useMarkAsRead();

  // Marcar como lida quando o dialog abrir
  useEffect(() => {
    if (isOpen && notification && userId) {
      console.log('Dialog opened, marking notification as read:', notification.id, 'for user:', userId);
      markAsReadMutation.mutate({
        notificationId: notification.id,
        userId: userId
      });
    }
  }, [isOpen, notification?.id, userId, markAsReadMutation]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  if (!notification) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-left">
            {notification.titulo}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Por: {notification.autor_nome}</span>
                <Badge variant={notification.tipo_autor === 'organizador' ? 'default' : 'secondary'}>
                  {notification.tipo_autor === 'organizador' ? 'Organizador' : 'Representante'}
                </Badge>
                <span>•</span>
                <span>
                  {format(new Date(notification.criado_em), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </span>
              </div>
              
              <div 
                className="prose prose-sm max-w-none text-left"
                dangerouslySetInnerHTML={{ __html: notification.mensagem }}
              />
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
