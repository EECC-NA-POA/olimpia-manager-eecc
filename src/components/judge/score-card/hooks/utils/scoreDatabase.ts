
import { supabase } from '@/lib/supabase';

interface AthleteData {
  atleta_id: string;
  equipe_id?: number;
}

interface ScoreRecordData {
  evento_id: string;
  modalidade_id: number;
  atleta_id: string;
  equipe_id: number | null;
  valor_pontuacao: any;
  unidade: any;
  observacoes: any;
  juiz_id: any;
  data_registro: any;
  tempo_minutos?: number;
  tempo_segundos?: number;
  bateria_id: number;
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
  console.log('Modality ID (type check):', modalityId, typeof modalityId);
  console.log('Athlete ID:', athlete.atleta_id);
  
  try {
    // Ensure modalityId is a proper integer
    const modalityIdInt = parseInt(modalityId.toString(), 10);
    console.log('Converted modalityId to integer:', modalityIdInt);
    
    // Ensure bateria_id is provided - if not, we need to get a default one
    let bateriaId = finalScoreData.bateria_id;
    
    if (!bateriaId) {
      console.log('No bateria_id provided, fetching default bateria for modality');
      // Get the first available bateria for this modality/event with explicit type casting
      const { data: bateriaResults, error: bateriaError } = await supabase
        .from('baterias')
        .select('id')
        .eq('modalidade_id', modalityIdInt)
        .eq('evento_id', eventId)
        .limit(1);
      
      if (bateriaError) {
        console.error('Error fetching bateria:', bateriaError);
        throw new Error(`Erro ao buscar bateria: ${bateriaError.message}`);
      }
      
      if (!bateriaResults || bateriaResults.length === 0) {
        throw new Error('Nenhuma bateria encontrada para esta modalidade. Configure as baterias primeiro.');
      }
      
      bateriaId = bateriaResults[0].id;
      console.log('Using default bateria ID:', bateriaId);
    }

    // Prepare the complete record data with explicit type casting
    const recordData: ScoreRecordData = {
      evento_id: eventId,
      modalidade_id: modalityIdInt, // Ensure this is an integer
      atleta_id: athlete.atleta_id,
      equipe_id: athlete.equipe_id || null,
      valor_pontuacao: finalScoreData.valor_pontuacao || null,
      unidade: finalScoreData.unidade || 'pontos',
      observacoes: finalScoreData.observacoes || null,
      juiz_id: finalScoreData.juiz_id,
      data_registro: finalScoreData.data_registro || new Date().toISOString(),
      bateria_id: parseInt(bateriaId.toString(), 10) // Ensure this is an integer
    };

    // Add optional time fields if they exist
    if (finalScoreData.tempo_minutos !== undefined && finalScoreData.tempo_minutos !== null) {
      recordData.tempo_minutos = finalScoreData.tempo_minutos;
    }
    if (finalScoreData.tempo_segundos !== undefined && finalScoreData.tempo_segundos !== null) {
      recordData.tempo_segundos = finalScoreData.tempo_segundos;
    }

    console.log('Record data to save (with type verification):', recordData);
    console.log('Type check - modalidade_id:', typeof recordData.modalidade_id);
    console.log('Type check - bateria_id:', typeof recordData.bateria_id);
    
    // First, try to find existing record using explicit casting
    const { data: existingRecords, error: fetchError } = await supabase
      .from('pontuacoes')
      .select('id')
      .eq('evento_id', eventId)
      .eq('modalidade_id', modalityIdInt)
      .eq('atleta_id', athlete.atleta_id);
    
    if (fetchError) {
      console.error('Error checking for existing record:', fetchError);
      throw new Error(`Erro ao verificar pontuação existente: ${fetchError.message}`);
    }
    
    const existingRecord = existingRecords && existingRecords.length > 0 ? existingRecords[0] : null;
    console.log('Existing record found:', existingRecord);
    
    let result;
    let operation;
    
    if (existingRecord) {
      // Update existing record
      console.log('Updating existing record with ID:', existingRecord.id);
      const { data: updateData, error: updateError } = await supabase
        .from('pontuacoes')
        .update(recordData)
        .eq('id', existingRecord.id)
        .select('*');
      
      if (updateError) {
        console.error('Error in update operation:', updateError);
        console.error('Update error details:', JSON.stringify(updateError, null, 2));
        throw new Error(`Erro ao atualizar pontuação: ${updateError.message}`);
      }
      
      result = updateData && updateData.length > 0 ? updateData[0] : null;
      operation = 'update';
    } else {
      // Insert new record
      console.log('Inserting new record');
      console.log('Data being inserted:', JSON.stringify(recordData, null, 2));
      
      const { data: insertData, error: insertError } = await supabase
        .from('pontuacoes')
        .insert([recordData])
        .select('*');
      
      if (insertError) {
        console.error('Error in insert operation:', insertError);
        console.error('Insert error details:', JSON.stringify(insertError, null, 2));
        console.error('Insert error code:', insertError.code);
        console.error('Insert error hint:', insertError.hint);
        throw new Error(`Erro ao inserir pontuação: ${insertError.message}`);
      }
      
      result = insertData && insertData.length > 0 ? insertData[0] : null;
      operation = 'insert';
    }
    
    console.log('Score saved successfully:', result);
    return { 
      success: true, 
      data: result, 
      operation: operation 
    };
    
  } catch (error: any) {
    console.error('=== SCORE SAVE OPERATION FAILED ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle specific database error codes
    if (error.code === '23505') {
      throw new Error('Já existe uma pontuação para este atleta nesta modalidade');
    }
    
    if (error.code === '42P01') {
      throw new Error('Erro de configuração da base de dados. Contacte o administrador.');
    }
    
    if (error.code === '23503') {
      throw new Error('Dados inválidos: verifique se o evento, modalidade e atleta existem');
    }
    
    // Check for missing FROM-clause errors specifically
    if (error.message?.includes('missing FROM-clause') || error.message?.includes('table "p"')) {
      throw new Error('Erro de configuração de trigger no banco de dados. Contacte o administrador sobre o trigger trg_replicate_team_scores.');
    }
    
    throw error;
  }
}
