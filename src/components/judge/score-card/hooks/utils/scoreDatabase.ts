
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
    // First, check if a record already exists
    console.log('Checking for existing record...');
    const { data: existingRecord, error: checkError } = await supabase
      .from('pontuacoes')
      .select('id')
      .eq('evento_id', eventId)
      .eq('modalidade_id', modalityId)
      .eq('atleta_id', athlete.atleta_id)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking for existing record:', checkError);
      throw checkError;
    }
    
    if (existingRecord) {
      // Update the existing record
      console.log('Updating existing record with ID:', existingRecord.id);
      const { data: updateResult, error: updateError } = await supabase
        .from('pontuacoes')
        .update(finalScoreData)
        .eq('id', existingRecord.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating record:', updateError);
        throw updateError;
      }
      
      console.log('Record updated successfully:', updateResult);
      return { success: true, data: updateResult };
    } else {
      // Insert a new record
      console.log('Inserting new record...');
      const { data: insertResult, error: insertError } = await supabase
        .from('pontuacoes')
        .insert(finalScoreData)
        .select()
        .single();
      
      if (insertError) {
        console.error('Error inserting record:', insertError);
        throw insertError;
      }
      
      console.log('Record inserted successfully:', insertResult);
      return { success: true, data: insertResult };
    }
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
}
