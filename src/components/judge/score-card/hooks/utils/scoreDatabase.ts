
import { supabase } from '@/integrations/supabase/client';

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
    // First, try to delete any existing score for this athlete/modality/event
    console.log('Deleting existing score if any...');
    const { error: deleteError } = await supabase
      .from('pontuacoes')
      .delete()
      .eq('evento_id', eventId)
      .eq('modalidade_id', modalityId)
      .eq('atleta_id', athlete.atleta_id);
    
    if (deleteError) {
      console.log('Delete operation result (may be empty):', deleteError);
    }
    
    // Now insert the new score
    console.log('Inserting new score...');
    const { data, error } = await supabase
      .from('pontuacoes')
      .insert([finalScoreData])
      .select();
    
    if (error) {
      console.error('Insert failed:', error);
      throw error;
    }
    
    console.log('Score inserted successfully:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
}
