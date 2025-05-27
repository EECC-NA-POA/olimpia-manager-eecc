
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
    // First, check if a score already exists
    const { data: existingScore, error: findError } = await supabase
      .from('pontuacoes')
      .select('id')
      .eq('evento_id', eventId)
      .eq('modalidade_id', modalityId)
      .eq('atleta_id', athlete.atleta_id)
      .maybeSingle();
    
    if (findError) {
      console.error('Error checking for existing score:', findError);
      throw findError;
    }
    
    let result;
    
    if (existingScore) {
      // Update existing score
      console.log('Updating existing score with ID:', existingScore.id);
      const { data, error } = await supabase
        .from('pontuacoes')
        .update(finalScoreData)
        .eq('id', existingScore.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating score:', error);
        throw error;
      }
      
      result = { success: true, data, operation: 'update' };
      console.log('Score updated successfully');
    } else {
      // Insert new score
      console.log('Inserting new score');
      const { data, error } = await supabase
        .from('pontuacoes')
        .insert(finalScoreData)
        .select()
        .single();
      
      if (error) {
        console.error('Error inserting score:', error);
        throw error;
      }
      
      result = { success: true, data, operation: 'insert' };
      console.log('Score inserted successfully');
    }
    
    return result;
    
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
}
