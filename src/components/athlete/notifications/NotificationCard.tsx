
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMarkAsRead } from '@/hooks/useMarkAsRead';
import type { Notification } from '@/types/notifications';

interface NotificationCardProps {
  notification: Notification;
  userId: string;
}

export function NotificationCard({ notification, userId }: NotificationCardProps) {
  const markAsReadMutation = useMarkAsRead();

  const handleMarkAsRead = () => {
    if (!notification.lida) {
      markAsReadMutation.mutate({
        notificationId: notification.id,
        userId: userId
      });
    }
  };

  const isUnread = !notification.lida;

  return (
    <Card 
      className={`${isUnread ? 'border-olimpics-orange-primary bg-orange-50' : 'border-gray-200'} cursor-pointer transition-colors hover:bg-gray-50`}
      onClick={handleMarkAsRead}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className={`font-semibold ${isUnread ? 'text-olimpics-text' : 'text-gray-700'}`}>
                {notification.titulo}
              </h4>
              <Badge variant={notification.tipo_autor === 'organizador' ? 'default' : 'secondary'}>
                {notification.tipo_autor === 'organizador' ? 'Organizador' : 'Representante'}
              </Badge>
              {isUnread && (
                <Badge variant="destructive" className="text-xs">
                  Nova
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-500 mb-2">
              Por: {notification.autor_nome}
            </div>
            <div 
              className="text-sm text-gray-600 mb-2 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: notification.mensagem }}
            />
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>
                {format(new Date(notification.criado_em), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </span>
              {isUnread && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead();
                  }}
                >
                  Marcar como lida
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
