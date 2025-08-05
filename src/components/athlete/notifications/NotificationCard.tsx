
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, differenceInHours, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { sanitizeFirstLine } from '@/lib/security/htmlSanitizer';
import type { Notification } from '@/types/notifications';

interface NotificationCardProps {
  notification: Notification;
  onClick: () => void;
}

// Função para extrair a primeira linha do texto HTML mantendo formatação básica
function getFirstLineWithFormatting(htmlContent: string): string {
  // Remove apenas tags de bloco que quebram o layout do card, mas mantém formatação inline
  const cleanContent = htmlContent
    .replace(/<\/?(div|p|h[1-6]|ul|ol|li)[^>]*>/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (cleanContent.length > 120) {
    return cleanContent.substring(0, 120) + '...';
  }
  return cleanContent;
}

// Função para calcular tempo relativo mais preciso
function getTimeAgo(date: string): string {
  const notificationDate = new Date(date);
  const now = new Date();
  
  const hoursAgo = differenceInHours(now, notificationDate);
  const daysAgo = differenceInDays(now, notificationDate);
  
  if (hoursAgo < 1) {
    return 'há poucos minutos';
  } else if (hoursAgo < 24) {
    return `há ${hoursAgo} hora${hoursAgo > 1 ? 's' : ''}`;
  } else if (daysAgo === 1) {
    return 'há 1 dia';
  } else {
    return `há ${daysAgo} dias`;
  }
}

export function NotificationCard({ notification, onClick }: NotificationCardProps) {
  const isUnread = !notification.lida;

  return (
    <Card 
      className={`${isUnread ? 'border-olimpics-orange-primary bg-orange-50' : 'border-gray-200'} cursor-pointer transition-colors hover:bg-gray-50`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Título em destaque */}
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-semibold text-lg leading-tight ${isUnread ? 'text-olimpics-text' : 'text-gray-700'}`}>
              {notification.titulo}
              {isUnread && (
                <Badge variant="destructive" className="text-xs ml-2">
                  Nova
                </Badge>
              )}
            </h4>
          </div>
          
          {/* Primeira linha da mensagem com formatação HTML */}
          <div 
            className="text-gray-600 text-sm leading-relaxed ql-editor"
            dangerouslySetInnerHTML={{ 
              __html: sanitizeFirstLine(notification.mensagem) 
            }}
          />
          
          {/* Data da postagem com cálculo mais preciso */}
          <div className="text-xs text-gray-500 pt-1">
            <span>
              {getTimeAgo(notification.criado_em)}
            </span>
          </div>

          {/* Informações do autor (sem destaque) */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Postada por: {notification.autor_nome}</span>
            <Badge 
              variant={notification.tipo_autor === 'organizador' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {notification.tipo_autor === 'organizador' ? 'Organizador' : 'Representante'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
