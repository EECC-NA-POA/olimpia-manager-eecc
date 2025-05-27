
import { supabase } from '@/lib/supabase';

interface AthleteData {
  atleta_id: string;
  equipe_id?: number;
}

export async function saveScoreToDatabase(
  finalScoreData: any,
  eventId: string,
  modalityId: number,
  athlete: AthleteData
) {
  console.log('Final score data being inserted:', finalScoreData);
  console.log('Event ID:', eventId);
  console.log('Modality ID:', modalityId);
  console.log('Athlete ID:', athlete.atleta_id);
  
  try {
    // Simple approach: delete existing record if it exists, then insert new one
    console.log('Deleting any existing record...');
    const { error: deleteError } = await supabase
      .from('pontuacoes')
      .delete()
      .eq('evento_id', eventId)
      .eq('modalidade_id', modalityId)
      .eq('atleta_id', athlete.atleta_id);
    
    if (deleteError) {
      console.log('No existing record to delete or error:', deleteError.message);
    } else {
      console.log('Existing record deleted successfully');
    }
    
    // Now insert the new record
    console.log('Inserting new record...');
    const { data, error } = await supabase
      .from('pontuacoes')
      .insert(finalScoreData);
    
    if (error) {
      console.error('Error inserting record:', error);
      throw error;
    }
    
    console.log('Record inserted successfully');
    return { success: true, data };
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
}
