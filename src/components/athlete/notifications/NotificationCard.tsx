
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';
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

/** Safely parse a Supabase timestamptz string ensuring UTC interpretation */
function parseTimestamp(raw: string): Date {
  if (!raw.endsWith('Z') && !raw.includes('+') && !/T\d{2}:\d{2}:\d{2}[+-]/.test(raw)) {
    return new Date(raw.replace(' ', 'T') + 'Z');
  }
  return new Date(raw);
}


export function NotificationCard({ notification, onClick }: NotificationCardProps) {
  const { i18n, t } = useTranslation();
  const isUnread = !notification.lida;

  const dateFnsLocale = i18n.language === 'es-ES' ? es : i18n.language === 'en-US' ? enUS : ptBR;
  const relativeTime = formatDistanceToNow(parseTimestamp(notification.criado_em), {
    addSuffix: true,
    locale: dateFnsLocale,
  });

  return (
    <Card
      className={`${isUnread ? 'border-olimpics-orange-primary bg-warning-background/50' : 'border-border'} cursor-pointer transition-colors hover:bg-accent`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-semibold text-lg leading-tight ${isUnread ? 'text-foreground' : 'text-foreground/70'}`}>
              {notification.titulo}
              {isUnread && (
                <Badge variant="destructive" className="text-xs ml-2">
                  {t('notifications.new')}
                </Badge>
              )}
            </h4>
          </div>

          <div
            className="text-muted-foreground text-sm leading-relaxed ql-editor"
            dangerouslySetInnerHTML={{
              __html: sanitizeFirstLine(notification.mensagem)
            }}
          />

          <div className="text-xs text-muted-foreground pt-1">
            <span>{relativeTime}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{t('notifications.postedBy', 'Postada por')}: {notification.autor_nome}</span>
            <Badge
              variant={notification.tipo_autor === 'organizador' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {notification.tipo_autor === 'organizador' ? t('notifications.authorOrganizer') : t('notifications.authorDelegation')}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
