
export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    // Check if date is valid before formatting
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateStr;
  }
};

export const createCronogramaTableIfNotExists = async (supabase: any) => {
  try {
    // Check if table exists
    const { error: checkError } = await supabase.rpc('check_if_table_exists', { table_name: 'cronograma' });
    
    if (checkError) {
      console.log('Creating cronograma table...');
      
      // Create table if it doesn't exist
      const { error } = await supabase.rpc('create_cronograma_table');
      
      if (error) {
        console.error('Error creating cronograma table:', error);
        return false;
      }
      console.log('Cronograma table created successfully');
      return true;
    }
    
    return true;
  } catch (e) {
    console.error('Error checking/creating cronograma table:', e);
    return false;
  }
};
