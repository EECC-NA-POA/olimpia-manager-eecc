
import { supabase } from '@/lib/supabase';
import { Event } from '@/types/api';

export const getAvailableEvents = async (userId: string): Promise<Event[]> => {
  try {
    console.log('Fetching available events for user:', userId);
    
    // Query the eventos table to get available events for this user
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('data_inicio_inscricao', { ascending: false });
    
    if (error) {
      console.error('Error fetching events:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No events found for user:', userId);
      return [];
    }

    console.log('Available events:', data);
    return data as Event[];
  } catch (error) {
    console.error('Error in getAvailableEvents:', error);
    return [];
  }
};
