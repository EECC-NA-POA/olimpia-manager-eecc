
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Notification } from '@/types/notifications';

interface NotificationCardProps {
  notification: Notification;
  onClick: () => void;
}

// Função para extrair a primeira linha do texto HTML
function getFirstLine(htmlContent: string): string {
  // Remove tags HTML e pega apenas o texto
  const textContent = htmlContent.replace(/<[^>]*>/g, '');
  
  // Pega a primeira linha ou os primeiros 100 caracteres
  const firstLine = textContent.split('\n')[0];
  if (firstLine.length > 100) {
    return firstLine.substring(0, 100) + '...';
  }
  return firstLine + (textContent.length > firstLine.length ? '...' : '');
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
          
          {/* Primeira linha da mensagem */}
          <p className="text-gray-600 text-sm leading-relaxed">
            {getFirstLine(notification.mensagem)}
          </p>
          
          {/* Data da postagem */}
          <div className="text-xs text-gray-500 pt-1">
            <span>
              {format(new Date(notification.criado_em), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
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
