
import React, { useEffect, useRef } from 'react';
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
  const hasMarkedAsRead = useRef<Set<string>>(new Set());

  // Marcar como lida quando o dialog abrir
  useEffect(() => {
    console.log('=== DIALOG EFFECT TRIGGERED ===');
    console.log('isOpen:', isOpen);
    console.log('notification?.id:', notification?.id);
    console.log('userId:', userId);
    console.log('notification?.lida:', notification?.lida);
    console.log('hasMarkedAsRead has this ID:', hasMarkedAsRead.current.has(notification?.id || ''));
    
    if (isOpen && notification && userId && !notification.lida && !hasMarkedAsRead.current.has(notification.id)) {
      console.log('=== MARKING NOTIFICATION AS READ ===');
      console.log('Marking notification as read:', notification.id, 'for user:', userId);
      
      // Marcar que já tentamos para esta notificação
      hasMarkedAsRead.current.add(notification.id);
      
      markAsReadMutation.mutate({
        notificationId: notification.id,
        userId: userId
      });
    } else {
      console.log('Skipping mark as read:', {
        isOpen,
        hasNotification: !!notification,
        hasUserId: !!userId,
        isAlreadyRead: notification?.lida,
        alreadyMarked: hasMarkedAsRead.current.has(notification?.id || '')
      });
    }
  }, [isOpen, notification?.id, userId, notification?.lida, markAsReadMutation]);

  // Reset quando o dialog fechar
  useEffect(() => {
    if (!isOpen) {
      console.log('=== DIALOG CLOSED - CLEARING MARKS ===');
      hasMarkedAsRead.current.clear();
    }
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    console.log('=== DIALOG OPEN CHANGE ===', open);
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
