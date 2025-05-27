
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
    // Use upsert (insert or update) instead of separate delete/insert
    console.log('Using upsert operation...');
    const { data, error } = await supabase
      .from('pontuacoes')
      .upsert(finalScoreData, {
        onConflict: 'evento_id,modalidade_id,atleta_id'
      });
    
    if (error) {
      console.error('Upsert failed, trying manual approach:', error);
      
      // Fallback: try direct insert (let database handle conflicts)
      const { data: insertData, error: insertError } = await supabase
        .from('pontuacoes')
        .insert(finalScoreData);
      
      if (insertError) {
        console.error('Insert also failed:', insertError);
        
        // Last resort: try update by finding the record first
        const { data: existingData, error: findError } = await supabase
          .from('pontuacoes')
          .select('id')
          .eq('evento_id', eventId)
          .eq('modalidade_id', modalityId)
          .eq('atleta_id', athlete.atleta_id)
          .limit(1);
        
        if (!findError && existingData && existingData.length > 0) {
          const { data: updateData, error: updateError } = await supabase
            .from('pontuacoes')
            .update(finalScoreData)
            .eq('id', existingData[0].id);
          
          if (updateError) {
            console.error('Update also failed:', updateError);
            throw updateError;
          }
          
          console.log('Record updated successfully via fallback');
          return { success: true, data: updateData };
        } else {
          throw insertError;
        }
      }
      
      console.log('Record inserted successfully via fallback');
      return { success: true, data: insertData };
    }
    
    console.log('Record upserted successfully');
    return { success: true, data };
    
  } catch (error) {
    console.error('All database operations failed:', error);
    throw error;
  }
}
