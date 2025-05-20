
import { SupabaseClient } from "@supabase/supabase-js";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// Format date to Brazilian format (DD/MM/YYYY)
export const formatDate = (dateStr: string) => {
  try {
    if (!dateStr) return '';
    const parsedDate = parseISO(dateStr);
    return format(parsedDate, "dd/MM/yyyy", { locale: ptBR });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateStr;
  }
};

// This function checks if the 'cronogramas' table exists and creates it if not
export const createCronogramaTableIfNotExists = async (supabase: SupabaseClient) => {
  try {
    // First, check if the table already exists by trying to select from it
    const { error } = await supabase
      .from('cronogramas')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') { // Table doesn't exist error code
      console.log('Creating cronogramas table...');
      
      // Create the table using SQL
      const { error: createError } = await supabase.rpc('create_cronogramas_table');
      
      if (createError) {
        console.error('Error creating cronogramas table:', createError);
      } else {
        console.log('Cronogramas table created successfully');
      }
    }
  } catch (error) {
    console.error('Error checking/creating cronogramas table:', error);
  }
};
