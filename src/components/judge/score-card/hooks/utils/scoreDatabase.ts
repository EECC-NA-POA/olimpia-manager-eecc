
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
    // First, try to upsert the score directly
    console.log('Attempting upsert operation...');
    const { data, error } = await supabase
      .from('pontuacoes')
      .upsert(finalScoreData, {
        onConflict: 'evento_id,modalidade_id,atleta_id'
      })
      .select();
    
    if (error) {
      console.error('Error in upsert operation:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    console.log('Score upserted successfully:', data);
    return { success: true, data: data?.[0] || data };
    
  } catch (error) {
    console.error('Database operation failed:', error);
    
    // If upsert fails, try a manual approach
    try {
      console.log('Upsert failed, trying manual check and insert/update...');
      
      // Check if record exists
      const { data: existingData, error: checkError } = await supabase
        .from('pontuacoes')
        .select('id')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('atleta_id', athlete.atleta_id)
        .limit(1);
      
      if (checkError) {
        console.error('Error checking existing record:', checkError);
        throw checkError;
      }
      
      if (existingData && existingData.length > 0) {
        // Update existing record
        console.log('Updating existing record with ID:', existingData[0].id);
        const { data: updateData, error: updateError } = await supabase
          .from('pontuacoes')
          .update(finalScoreData)
          .eq('id', existingData[0].id)
          .select();
        
        if (updateError) {
          console.error('Error updating record:', updateError);
          throw updateError;
        }
        
        console.log('Record updated successfully:', updateData);
        return { success: true, data: updateData?.[0] || updateData };
      } else {
        // Insert new record
        console.log('Inserting new record...');
        const { data: insertData, error: insertError } = await supabase
          .from('pontuacoes')
          .insert([finalScoreData])
          .select();
        
        if (insertError) {
          console.error('Error inserting record:', insertError);
          throw insertError;
        }
        
        console.log('Record inserted successfully:', insertData);
        return { success: true, data: insertData?.[0] || insertData };
      }
    } catch (fallbackError) {
      console.error('Fallback operation also failed:', fallbackError);
      throw fallbackError;
    }
  }
}
