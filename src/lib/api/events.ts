
import { supabase } from '@/lib/supabase';
import { Event } from '@/types/api';

export const getAvailableEvents = async (userId: string): Promise<Event[]> => {
  try {
    console.log('Fetching available events for user:', userId);
    
    // 1. Get event IDs where user is registered
    const { data: userRegistrations, error: regError } = await supabase
      .from('inscricoes_eventos')
      .select('evento_id')
      .eq('usuario_id', userId);
    
    if (regError) {
      console.error('Error fetching user registrations:', regError);
      throw regError;
    }

    if (!userRegistrations || userRegistrations.length === 0) {
      console.log('User is not registered in any events');
      return [];
    }

    const registeredEventIds = userRegistrations.map(reg => reg.evento_id);
    console.log('User is registered in', registeredEventIds.length, 'events:', registeredEventIds);

    // 2. Fetch full event details for registered events
    const { data: events, error: eventsError } = await supabase
      .from('eventos')
      .select('*')
      .in('id', registeredEventIds)
      .order('data_inicio_inscricao', { ascending: false });
    
    if (eventsError) {
      console.error('Error fetching event details:', eventsError);
      throw eventsError;
    }

    console.log('Available events (registered only):', events?.length || 0);
    return events as Event[];
  } catch (error) {
    console.error('Error in getAvailableEvents:', error);
    return [];
  }
};
