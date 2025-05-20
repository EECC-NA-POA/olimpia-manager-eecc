
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
        console.log('Fetching events for user:', userId);
        
        // Get all events
        const { data: events, error } = await supabase
          .from('eventos')
          .select('*')
          .order('data_inicio_inscricao', { ascending: false });

        if (error) {
          console.error('Error fetching events:', error);
          throw error;
        }

        if (!events || events.length === 0) {
          console.log('No events found');
          return [];
        }

        console.log('Events found:', events.length);
        
        // Get user registrations directly from the inscricoes_usuarios_eventos table
        const { data: registrations, error: regError } = await supabase
          .from('inscricoes_usuarios_eventos')
          .select('evento_id, status')
          .eq('usuario_id', userId);
        
        if (regError) {
          console.error('Error fetching user registrations:', regError);
          console.log('Continuing with unregistered events');
          // Don't throw error, just continue with events without registration status
        } 
        
        // If we have registrations, mark events as registered
        if (registrations && registrations.length > 0) {
          console.log('User registrations found:', registrations);
          const registeredEventIds = registrations.map(reg => reg.evento_id);
          console.log('User registered in events:', registeredEventIds);
          
          // Add isRegistered flag to each event
          return events.map(event => ({
            ...event,
            isRegistered: registeredEventIds.includes(event.id)
          }));
        }
        
        // If no registrations found, return events with isRegistered = false
        return events.map(event => ({
          ...event,
          isRegistered: false
        }));
      } catch (error: any) {
        console.error('Error in useEventQuery:', error);
        toast.error('Erro ao carregar eventos');
        return [];
      }
    },
    enabled: !!userId && enabled,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60, // 1 minute
    meta: {
      onSuccess: (data: any[]) => {
        console.log(`Successfully fetched ${data.length} events`);
      }
    }
  });
};
