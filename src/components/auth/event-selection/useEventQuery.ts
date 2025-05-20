
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
        
        // Check if we need to query registered events
        // First check if the table exists (to prevent errors on table not found)
        const { data: tableInfo, error: tableError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_name', 'registros_usuarios_eventos')
          .eq('table_schema', 'public');
          
        // If table exists and no error, get user registrations
        if (!tableError && tableInfo && tableInfo.length > 0) {
          console.log('Fetching user event registrations');
          const { data: registrations, error: regError } = await supabase
            .from('registros_usuarios_eventos')
            .select('evento_id')
            .eq('usuario_id', userId);

          if (regError) {
            console.error('Error fetching registrations:', regError);
            // Don't throw error, just continue with events without registration status
          } else if (registrations && registrations.length > 0) {
            const registeredEventIds = registrations.map(reg => reg.evento_id);
            console.log('User registered in events:', registeredEventIds);
            
            // Add isRegistered flag to each event
            return events.map(event => ({
              ...event,
              isRegistered: registeredEventIds.includes(event.id)
            }));
          }
        }
        
        // If table doesn't exist or no registrations found, return events with isRegistered = false
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
    onSuccess: (data) => {
      console.log(`Successfully fetched ${data.length} events`);
    }
  });
};
