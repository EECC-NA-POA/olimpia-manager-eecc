
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SupabaseClient } from '@supabase/supabase-js';

export const formatDate = (dateStr: string) => {
  try {
    const date = parseISO(dateStr);
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr;
  }
};

// Updated to use cronogramas (plural)
export const createCronogramaTableIfNotExists = async (supabase: SupabaseClient) => {
  try {
    // Check if table exists first
    const { data: tableExists } = await supabase
      .from('cronogramas')
      .select('id')
      .limit(1);
    
    // If we got a response, table exists
    if (tableExists !== null) {
      console.log('Cronogramas table exists');
      return;
    }
    
    console.log('Cronogramas table does not exist, will attempt to create');
    
    // This is just a fallback and should be handled properly in migrations
    const { error } = await supabase.rpc('create_cronogramas_table_if_not_exists');
    
    if (error) {
      console.error('Error creating cronogramas table:', error);
    } else {
      console.log('Cronogramas table created successfully');
    }
  } catch (error) {
    console.error('Error checking/creating cronogramas table:', error);
  }
};
