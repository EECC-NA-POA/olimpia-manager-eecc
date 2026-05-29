/**
 * useNotificationsList Hook
 * 
 * Gerencia a LISTA de notificações push do usuário (tabela public.notifications):
 * - Query de notificações
 * - Contador de não lidas
 * - Marcar como lida
 * - Marcar todas como lidas
 * - Realtime subscription
 * - Sincronização com badge do app
 */

import { useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { updateAppBadge } from '@/services/badgeService';

export interface NotificationItem {
    id: string;
    type: 'enrollment_confirmed' | 'game_reminder' | 'result_published' | 'general_announcement';
    title: string;
    body: string;
    data: Record<string, any>;
    read: boolean;
    created_at: string;
}

export interface UseNotificationsListReturn {
    notifications: NotificationItem[];
    unreadCount: number;
    isLoading: boolean;
    isError: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refetch: () => Promise<void>;
}

export function useNotificationsList(): UseNotificationsListReturn {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Query para buscar notificações push do usuário
    const {
        data: notifications = [],
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['notifications-list', user?.id],
        queryFn: async () => {
            if (!user) return [];

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            return data as NotificationItem[];
        },
        enabled: !!user,
    });

    // Calcular contador de não lidas
    const unreadCount = useMemo(() => {
        return notifications.filter((n) => !n.read).length;
    }, [notifications]);

    // Mutation para marcar como lida
    const markAsReadMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id)
                .eq('user_id', user?.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications-list', user?.id] });
        },
    });

    // Mutation para marcar todas como lidas
    const markAllAsReadMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', user?.id)
                .eq('read', false);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications-list', user?.id] });
        },
    });

    // Realtime subscription
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('notifications-list-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    console.log('[NotificationsList] Realtime update:', payload);
                    queryClient.invalidateQueries({ queryKey: ['notifications-list', user.id] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient]);

    // Sincronizar badge do app com contador de não lidas
    useEffect(() => {
        updateAppBadge(unreadCount);
    }, [unreadCount]);

    return {
        notifications,
        unreadCount,
        isLoading,
        isError,
        markAsRead: markAsReadMutation.mutateAsync,
        markAllAsRead: markAllAsReadMutation.mutateAsync,
        refetch: async () => {
            await refetch();
        },
    };
}
