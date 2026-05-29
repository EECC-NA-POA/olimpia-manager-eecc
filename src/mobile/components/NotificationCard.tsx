/**
 * NotificationCard Component
 * 
 * Card individual de notificação com:
 * - Ícone por tipo
 * - Título e corpo (truncado)
 * - Tempo relativo
 * - Indicador de não lida
 */

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, Calendar, Trophy, Bell } from 'lucide-react';
import type { NotificationItem } from '@/hooks/useNotificationsList';

interface NotificationCardProps {
    notification: NotificationItem;
    onMarkAsRead: (id: string) => void;
}

const notificationIcons = {
    enrollment_confirmed: { icon: CheckCircle, color: '#16A34A' },
    game_reminder: { icon: Calendar, color: '#2563EB' },
    result_published: { icon: Trophy, color: '#CA8A04' },
    general_announcement: { icon: Bell, color: '#6B7280' },
};

export function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
    const { icon: Icon, color } = notificationIcons[notification.type];

    const relativeTime = formatDistanceToNow(new Date(notification.created_at), {
        addSuffix: true,
        locale: ptBR,
    });

    const handleClick = () => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`
        p-4 rounded-lg border cursor-pointer transition-all
        ${notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}
        hover:shadow-md active:scale-[0.98]
      `}
        >
            <div className="flex gap-3">
                {/* Ícone por tipo */}
                <div className="flex-shrink-0">
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                    >
                        <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm">
                            {notification.title}
                        </h3>
                        {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                        )}
                    </div>

                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.body}
                    </p>

                    <span className="text-xs text-gray-500 mt-2 block">
                        {relativeTime}
                    </span>
                </div>
            </div>
        </div>
    );
}
