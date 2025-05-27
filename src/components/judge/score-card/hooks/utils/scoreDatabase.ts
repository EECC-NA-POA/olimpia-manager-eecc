
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
  console.log('=== STARTING SCORE SAVE OPERATION ===');
  console.log('Final score data:', finalScoreData);
  console.log('Event ID:', eventId);
  console.log('Modality ID:', modalityId);
  console.log('Athlete ID:', athlete.atleta_id);
  
  try {
    // Step 1: Try to find existing score using simple select
    console.log('Step 1: Checking for existing score...');
    
    const { data: existingScores, error: selectError } = await supabase
      .from('pontuacoes')
      .select('id, evento_id, modalidade_id, atleta_id')
      .eq('evento_id', eventId)
      .eq('modalidade_id', modalityId)
      .eq('atleta_id', athlete.atleta_id);
    
    if (selectError) {
      console.error('Error in select query:', selectError);
      throw new Error(`Erro ao verificar pontuação existente: ${selectError.message}`);
    }
    
    console.log('Existing scores found:', existingScores);
    
    const existingScore = existingScores && existingScores.length > 0 ? existingScores[0] : null;
    
    if (existingScore) {
      // Step 2: Update existing score
      console.log('Step 2: Updating existing score with ID:', existingScore.id);
      
      const { data: updatedData, error: updateError } = await supabase
        .from('pontuacoes')
        .update({
          valor_pontuacao: finalScoreData.valor_pontuacao,
          unidade: finalScoreData.unidade,
          observacoes: finalScoreData.observacoes,
          juiz_id: finalScoreData.juiz_id,
          data_registro: finalScoreData.data_registro,
          tempo_minutos: finalScoreData.tempo_minutos || null,
          tempo_segundos: finalScoreData.tempo_segundos || null,
          tempo_milissegundos: finalScoreData.tempo_milissegundos || null,
          bateria_id: finalScoreData.bateria_id || null
        })
        .eq('id', existingScore.id)
        .select();
      
      if (updateError) {
        console.error('Error in update query:', updateError);
        throw new Error(`Erro ao atualizar pontuação: ${updateError.message}`);
      }
      
      console.log('Score updated successfully:', updatedData);
      return { 
        success: true, 
        data: updatedData?.[0] || updatedData, 
        operation: 'update' 
      };
      
    } else {
      // Step 3: Insert new score
      console.log('Step 3: Inserting new score...');
      
      const insertData = {
        evento_id: eventId,
        modalidade_id: modalityId,
        atleta_id: athlete.atleta_id,
        equipe_id: athlete.equipe_id || null,
        valor_pontuacao: finalScoreData.valor_pontuacao,
        unidade: finalScoreData.unidade,
        observacoes: finalScoreData.observacoes || null,
        juiz_id: finalScoreData.juiz_id,
        data_registro: finalScoreData.data_registro,
        tempo_minutos: finalScoreData.tempo_minutos || null,
        tempo_segundos: finalScoreData.tempo_segundos || null,
        tempo_milissegundos: finalScoreData.tempo_milissegundos || null,
        bateria_id: finalScoreData.bateria_id || null
      };
      
      console.log('Data to insert:', insertData);
      
      const { data: insertedData, error: insertError } = await supabase
        .from('pontuacoes')
        .insert(insertData)
        .select();
      
      if (insertError) {
        console.error('Error in insert query:', insertError);
        throw new Error(`Erro ao inserir pontuação: ${insertError.message}`);
      }
      
      console.log('Score inserted successfully:', insertedData);
      return { 
        success: true, 
        data: insertedData?.[0] || insertedData, 
        operation: 'insert' 
      };
    }
    
  } catch (error: any) {
    console.error('=== SCORE SAVE OPERATION FAILED ===');
    console.error('Error details:', error);
    
    // If it's a database constraint error, provide more specific feedback
    if (error.code === '23505') {
      throw new Error('Já existe uma pontuação para este atleta nesta modalidade');
    }
    
    if (error.code === '42P01') {
      throw new Error('Erro de configuração da base de dados. Contacte o administrador.');
    }
    
    if (error.code === '23503') {
      throw new Error('Dados inválidos: verifique se o evento, modalidade e atleta existem');
    }
    
    throw error;
  }
}
