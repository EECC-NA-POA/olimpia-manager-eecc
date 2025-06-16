
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
  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-700">
                {notification.autor_nome}
              </h4>
              <Badge variant={notification.tipo_autor === 'organizador' ? 'default' : 'secondary'}>
                {notification.tipo_autor === 'organizador' ? 'Organizador' : 'Representante'}
              </Badge>
            </div>
            <div 
              className="text-sm text-gray-600 mb-2 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: notification.mensagem }}
            />
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>
                {format(new Date(notification.criado_em), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
