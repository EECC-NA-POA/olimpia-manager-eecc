/**
 * MobileNotifications Screen
 * 
 * Tela de notificações de EVENTOS do usuário (tabela notificacoes)
 * Mostra mensagens de organizadores e representantes de delegação
 */

import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck, Plus, Trash2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useMarkAsRead } from '@/hooks/useMarkAsRead';
import { useHideNotification } from '@/hooks/useHideNotification';
import { useActiveEvent } from '@/hooks/useActiveEvent';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoleCheck } from '@/hooks/useUserRoleCheck';
import { useNavigate } from 'react-router-dom';
import { useHaptics } from '@/hooks/useHaptics';
import { clearAppBadge, updateAppBadge } from '@/services/badgeService';
import type { Notification } from '@/types/notifications';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';

/** Safely parse a Supabase timestamptz string ensuring UTC interpretation */
function parseTimestamp(raw: string): Date {
    // If Supabase omits the timezone suffix, append 'Z' so JS reads it as UTC
    if (!raw.endsWith('Z') && !raw.includes('+') && !/T\d{2}:\d{2}:\d{2}[+-]/.test(raw)) {
        return new Date(raw.replace(' ', 'T') + 'Z');
    }
    return new Date(raw);
}

interface MobileNotificationCardProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
}

function MobileNotificationCard({ notification, onMarkAsRead }: MobileNotificationCardProps) {
    const { i18n, t } = useTranslation();
    const isUnread = !notification.lida;
    const { user } = useAuth();
    const { mutate: hideNotification } = useHideNotification();

    const [tx, setTx] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const touchStartX = useRef<number | null>(null);

    const dateFnsLocale = i18n.language === 'es-ES' ? es : i18n.language === 'en-US' ? enUS : ptBR;

    const relativeTime = formatDistanceToNow(parseTimestamp(notification.criado_em), {
        addSuffix: true,
        locale: dateFnsLocale,
    });

    const handleClick = () => {
        if (tx !== 0) {
            setTx(0);
            return;
        }
        if (!notification.lida) {
            onMarkAsRead(notification.id);
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - touchStartX.current;

        if (diff < 0) {
            setTx(Math.max(diff, -80));
        } else if (tx < 0 && diff > 0) {
            setTx(Math.min(tx + diff, 0));
        }
    };

    const handleTouchEnd = () => {
        touchStartX.current = null;
        if (tx < -40) {
            setTx(-80);
        } else {
            setTx(0);
        }
    };

    const handleConfirmDelete = () => {
        if (!user?.id) return;
        hideNotification({ notificationId: notification.id, userId: user.id });
        setIsDeleting(true);
    };

    if (isDeleting) return null;

    return (
        <div className="relative overflow-hidden mb-3 rounded-xl border border-gray-100 shadow-sm bg-red-500">
            {/* Action button behind the card */}
            <div className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <button className="w-full h-full flex flex-col items-center justify-center text-white outline-none">
                            <Trash2 className="w-6 h-6" />
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="w-11/12 rounded-xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('notifications.deleteConfirmTitle', 'Excluir notificação?')}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t('notifications.deleteConfirmDescription', 'Esta notificação não aparecerá mais para você. Deseja continuar?')}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-row gap-2 sm:space-x-0">
                            <AlertDialogCancel className="w-full mt-0" onClick={() => setTx(0)}>{t('common.cancel', 'Cancelar')}</AlertDialogCancel>
                            <AlertDialogAction className="w-full bg-red-600 hover:bg-red-700" onClick={handleConfirmDelete}>{t('common.delete', 'Excluir')}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* Draggable surface */}
            <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="transition-transform duration-200 ease-out bg-white h-full relative border-l-4"
                style={{ transform: `translateX(${tx}px)`, borderLeftColor: isUnread ? '#3b82f6' : 'transparent' }}
            >
                <div
                    onClick={handleClick}
                    className={`
                        p-4 cursor-pointer
                        ${isUnread ? 'bg-blue-50/30' : 'bg-white'}
                        active:bg-gray-50
                    `}
                >
                    <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-semibold text-base ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.titulo}
                            </h4>
                            {isUnread && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                            )}
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2">
                            {notification.mensagem.replace(/<[^>]+>/g, '').substring(0, 150)}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{relativeTime}</span>
                            <Badge variant={notification.tipo_autor === 'organizador' ? 'default' : 'secondary'}>
                                {notification.tipo_autor === 'organizador' ? t('notifications.authorOrganizer') : t('notifications.authorDelegation')}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MobileNotifications() {
    const { t } = useTranslation();
    const haptics = useHaptics();
    const { user } = useAuth();
    const { activeEvent } = useActiveEvent();
    const navigate = useNavigate();
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Verificar papéis usando o hook seguro diretamente no banco
    const { data: roleData } = useUserRoleCheck(user?.id, activeEvent?.id || null);
    const isOrganizer = roleData?.isOrganizer || user?.is_master;
    const isRepresentante = roleData?.isRepresentante;
    const canCreateNotification = isOrganizer || isRepresentante;

    // Usar hook de EVENTOS (tabela notificacoes)
    const {
        data: notifications = [],
        isLoading,
        refetch,
    } = useNotifications({
        eventId: activeEvent?.id || '',
        userId: user?.id || '',
        includeAuthoredHidden: false,
    });

    const { mutate: markAsRead } = useMarkAsRead();

    const unreadCount = notifications.filter((n) => !n.lida).length;

    useEffect(() => {
        updateAppBadge(unreadCount);
    }, [unreadCount]);

    useEffect(() => {
        clearAppBadge();
    }, []);

    const handleRefresh = async () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        haptics.impact('light');
        try {
            await refetch();
        } finally {
            setTimeout(() => setIsRefreshing(false), 600);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        haptics.impact('light');
        markAsRead({ notificationId, userId: user?.id || '' });
    };

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) return;
        haptics.impact('medium');
        const unreadIds = notifications.filter((n) => !n.lida).map((n) => n.id);
        for (const id of unreadIds) {
            markAsRead({ notificationId: id, userId: user?.id || '' });
        }
        haptics.success();
    };

    // Pull-to-refresh
    const scrollRef = useRef<HTMLDivElement>(null);
    const touchStartY = useRef(0);
    const [pullDistance, setPullDistance] = useState(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const scrollEl = scrollRef.current;
        if (!scrollEl) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - touchStartY.current;
        if (scrollEl.scrollTop === 0 && diff > 0 && !isRefreshing) {
            setPullDistance(Math.min(diff * 0.5, 80));
        }
    };

    const handleTouchEnd = () => {
        if (pullDistance > 50 && !isRefreshing) {
            handleRefresh();
        }
        setPullDistance(0);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="bg-green-800 text-white p-4 shadow-md">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">{t('notifications.title')}</h1>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-md text-sm hover:bg-white/30 active:bg-white/40 transition"
                        >
                            <CheckCheck className="w-4 h-4" />
                            {t('notifications.markAllRead')}
                        </button>
                    )}
                </div>
                {unreadCount > 0 && (
                    <p className="text-sm text-white/80 mt-1">
                        {unreadCount} {unreadCount === 1 ? t('notifications.unreadSingular') : t('notifications.unreadPlural')}
                    </p>
                )}
            </div>

            {/* Pull-to-refresh indicator */}
            {(pullDistance > 0 || isRefreshing) && (
                <div
                    className="flex items-center justify-center bg-gray-100 overflow-hidden transition-all"
                    style={{ height: isRefreshing ? 48 : pullDistance }}
                >
                    <div className={`rounded-full h-6 w-6 border-2 border-green-800 border-t-transparent ${isRefreshing || pullDistance > 50 ? 'animate-spin' : ''}`} />
                    {!isRefreshing && pullDistance > 10 && pullDistance <= 50 && (
                        <span className="ml-2 text-xs text-gray-500">{t('notifications.pullToRefresh')}</span>
                    )}
                    {!isRefreshing && pullDistance > 50 && (
                        <span className="ml-2 text-xs text-green-700">{t('notifications.releaseToRefresh')}</span>
                    )}
                    {isRefreshing && (
                        <span className="ml-2 text-xs text-gray-500">{t('notifications.refreshing')}</span>
                    )}
                </div>
            )}

            {/* Content */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                        <Bell className="w-16 h-16 text-gray-300 mb-4" />
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">
                            {t('notifications.empty')}
                        </h2>
                        <p className="text-sm text-gray-500 text-center">
                            {t('notifications.emptyDescription')}
                        </p>
                    </div>
                ) : (
                    <div className="p-4 space-y-3">
                        {notifications.map((notification) => (
                            <MobileNotificationCard
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={handleMarkAsRead}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Action Button (FAB) for Organizers and Delegation Reps */}
            {canCreateNotification && (
                <button
                    onClick={() => navigate('/m/notifications/create')}
                    className="fixed right-6 w-14 h-14 bg-green-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 active:scale-95 transition-all z-50"
                    style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}
                    aria-label={t('notifications.createNew')}
                >
                    <Plus className="w-6 h-6" />
                </button>
            )}
        </div>
    );
}

export default MobileNotifications;
