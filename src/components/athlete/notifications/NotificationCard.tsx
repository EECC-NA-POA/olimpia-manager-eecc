
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Notification } from '@/types/notifications';

interface NotificationCardProps {
  notification: Notification;
  userId: string;
}

export function NotificationCard({ notification, userId }: NotificationCardProps) {
  const isUnread = !notification.lida;

  return (
    <Card className={`${isUnread ? 'border-olimpics-orange-primary bg-orange-50' : 'border-gray-200'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className={`font-semibold ${isUnread ? 'text-olimpics-text' : 'text-gray-700'}`}>
                {notification.titulo}
              </h4>
              {isUnread && (
                <Badge variant="destructive" className="text-xs">
                  Nova
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {notification.conteudo}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>
                {format(new Date(notification.data_criacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </span>
              {notification.data_expiracao && (
                <span>
                  Expira em: {format(new Date(notification.data_expiracao), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
