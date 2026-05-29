/**
 * useActiveEvent Hook
 * 
 * Retorna o evento ativo do AuthContext (arquitetura centrada em eventos)
 * Busca dados completos do evento se necessário
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function useActiveEvent() {
    const { currentEventId } = useAuth();

    // Buscar dados completos do evento ativo
    const { data: activeEvent, isLoading, error } = useQuery({
        queryKey: ['active-event', currentEventId],
        queryFn: async () => {
            if (!currentEventId) return null;

            const { data, error } = await supabase
                .from('eventos')
                .select('*')
                .eq('id', currentEventId)
                .single();

            if (error) {
                console.error('[useActiveEvent] Error fetching event:', error);
                throw error;
            }

            return data;
        },
        enabled: !!currentEventId,
        staleTime: 5 * 60 * 1000, // 5 minutos
    });

    return {
        activeEvent,
        currentEventId,
        isLoading,
        error
    };
}
