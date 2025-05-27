
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
  
  // Check if score already exists
  const { data: existingScore } = await supabase
    .from('pontuacoes')
    .select('id')
    .eq('evento_id', eventId)
    .eq('modalidade_id', modalityId)
    .eq('atleta_id', athlete.atleta_id)
    .maybeSingle();
  
  if (existingScore) {
    // Update existing score
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
    const { data, error } = await supabase
      .from('pontuacoes')
      .insert([finalScoreData])
      .select();
      
    if (error) {
      console.error('Error inserting score:', error);
      throw error;
    }
    
    console.log('Score inserted successfully:', data);
    return { success: true, data };
  }
}
