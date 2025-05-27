
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
    // Step 1: Check for existing score
    console.log('Step 1: Checking for existing score...');
    
    const { data: existingScores, error: selectError } = await supabase
      .from('pontuacoes')
      .select('id')
      .eq('evento_id', eventId)
      .eq('modalidade_id', modalityId)
      .eq('atleta_id', athlete.atleta_id);
    
    if (selectError) {
      console.error('Error in select query:', selectError);
      throw new Error(`Erro ao verificar pontuação existente: ${selectError.message}`);
    }
    
    console.log('Existing scores found:', existingScores);
    
    const existingScore = existingScores && existingScores.length > 0 ? existingScores[0] : null;
    
    // Prepare basic data structure with only confirmed columns
    const basicData: any = {
      valor_pontuacao: finalScoreData.valor_pontuacao || null,
      unidade: finalScoreData.unidade || 'pontos',
      observacoes: finalScoreData.observacoes || null,
      juiz_id: finalScoreData.juiz_id,
      data_registro: finalScoreData.data_registro || new Date().toISOString()
    };

    // Add optional fields only if they have values
    if (finalScoreData.tempo_minutos !== undefined && finalScoreData.tempo_minutos !== null) {
      basicData.tempo_minutos = finalScoreData.tempo_minutos;
    }
    if (finalScoreData.tempo_segundos !== undefined && finalScoreData.tempo_segundos !== null) {
      basicData.tempo_segundos = finalScoreData.tempo_segundos;
    }
    if (finalScoreData.bateria_id !== undefined && finalScoreData.bateria_id !== null) {
      basicData.bateria_id = finalScoreData.bateria_id;
    }

    console.log('Prepared basic data:', basicData);
    
    if (existingScore) {
      // Step 2: Update existing score
      console.log('Step 2: Updating existing score with ID:', existingScore.id);
      
      const { data: updatedData, error: updateError } = await supabase
        .from('pontuacoes')
        .update(basicData)
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
        ...basicData
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
    
    // Provide specific error messages for common database issues
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
