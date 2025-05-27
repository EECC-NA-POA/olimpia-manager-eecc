
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
    // Check if score already exists
    const { data: existingScore, error: selectError } = await supabase
      .from('pontuacoes')
      .select('id')
      .eq('evento_id', eventId)
      .eq('modalidade_id', modalityId)
      .eq('atleta_id', athlete.atleta_id)
      .maybeSingle();
    
    if (selectError) {
      console.error('Error checking existing score:', selectError);
      throw selectError;
    }
    
    console.log('Existing score check result:', existingScore);
    
    if (existingScore) {
      // Update existing score
      console.log('Updating existing score with ID:', existingScore.id);
      const { data, error } = await supabase
        .from('pontuacoes')
        .update(finalScoreData)
        .eq('id', existingScore.id)
        .select();
        
      if (error) {
        console.error('Error updating score:', error);
        throw error;
      }
      
      console.log('Score updated successfully:', data);
      return { success: true, data };
    } else {
      // Insert new score
      console.log('Inserting new score...');
      const { data, error } = await supabase
        .from('pontuacoes')
        .insert(finalScoreData)
        .select();
        
      if (error) {
        console.error('Error inserting score:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log('Score inserted successfully:', data);
      return { success: true, data };
    }
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
}
