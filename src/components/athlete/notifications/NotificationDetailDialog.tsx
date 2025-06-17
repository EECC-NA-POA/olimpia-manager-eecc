
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
  const hasMarkedAsRead = useRef<string | null>(null);

  // Marcar como lida quando o dialog abrir
  useEffect(() => {
    console.log('=== DIALOG EFFECT TRIGGERED ===');
    console.log('isOpen:', isOpen);
    console.log('notification?.id:', notification?.id);
    console.log('userId:', userId);
    console.log('hasMarkedAsRead.current:', hasMarkedAsRead.current);
    console.log('notification?.lida:', notification?.lida);
    
    if (isOpen && notification && userId && hasMarkedAsRead.current !== notification.id) {
      console.log('=== DIALOG OPENED - MARKING AS READ ===');
      console.log('Dialog opened, marking notification as read:', notification.id, 'for user:', userId);
      console.log('Notification is currently read?', notification.lida);
      
      // Marcar que já tentamos para esta notificação
      hasMarkedAsRead.current = notification.id;
      
      // Só marcar como lida se ainda não estiver lida
      if (!notification.lida) {
        console.log('Notification is unread, calling markAsRead mutation...');
        markAsReadMutation.mutate({
          notificationId: notification.id,
          userId: userId
        });
      } else {
        console.log('Notification is already read, skipping mutation');
      }
    }
  }, [isOpen, notification?.id, userId, notification?.lida, markAsReadMutation]);

  // Reset ref quando o dialog fechar
  useEffect(() => {
    if (!isOpen) {
      console.log('=== DIALOG CLOSED - RESETTING REF ===');
      hasMarkedAsRead.current = null;
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
