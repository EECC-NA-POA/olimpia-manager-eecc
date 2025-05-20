
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useEventQuery = (userId: string | undefined, enabled: boolean = true) => {
  // Only fetch events if userId is provided and privacy policy is accepted (enabled)
  return useQuery({
    queryKey: ['events', userId],
    queryFn: async () => {
      if (!userId) {
        return [];
      }

      try {
        // Get all events
        const { data: events, error } = await supabase
          .from('eventos')
          .select('*')
          .order('data_inicio', { ascending: false });

        if (error) {
          throw error;
        }

        if (!events || events.length === 0) {
          return [];
        }

        // Get user's event registrations
        const { data: registrations, error: regError } = await supabase
          .from('registros_usuarios_eventos')
          .select('evento_id')
          .eq('usuario_id', userId);

        if (regError) {
          throw regError;
        }

        const registeredEventIds = (registrations || []).map(reg => reg.evento_id);

        // Add isRegistered flag to each event
        return events.map(event => ({
          ...event,
          isRegistered: registeredEventIds.includes(event.id)
        }));
      } catch (error: any) {
        console.error('Error fetching events:', error);
        toast.error('Erro ao carregar eventos');
        return [];
      }
    },
    enabled: !!userId && enabled,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60, // 1 minute
  });
};
