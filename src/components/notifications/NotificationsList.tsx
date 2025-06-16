
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationsListProps {
  eventId: string;
  userId?: string;
}

export function NotificationsList({ eventId, userId }: NotificationsListProps) {
  const { data: notifications, isLoading } = useNotifications({ 
    eventId, 
    userId 
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-orange-primary" />
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhuma notificação encontrada para este evento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card key={notification.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{notification.autor_nome}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={notification.tipo_autor === 'organizador' ? 'default' : 'secondary'}>
                  {notification.tipo_autor === 'organizador' ? 'Organizador' : 'Representante'}
                </Badge>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(notification.criado_em), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: notification.mensagem }}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
