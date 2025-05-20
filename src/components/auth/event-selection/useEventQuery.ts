
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
        
        // Check for user registrations by querying the inscricoes table
        // This approach is more reliable as it directly uses the main inscricoes table
        const { data: registrations, error: regError } = await supabase
          .from('inscricoes')
          .select('evento_id')
          .eq('usuario_id', userId);
        
        if (regError) {
          console.error('Error fetching user registrations from inscricoes table:', regError);
          // Continue with events but mark them as not registered
          return events.map(event => ({
            ...event,
            isRegistered: false
          }));
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
