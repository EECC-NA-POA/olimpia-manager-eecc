
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
  bateria_id: number; // Make this required since DB requires it
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
    // Ensure bateria_id is provided - if not, we need to get a default one
    let bateriaId = finalScoreData.bateria_id;
    
    if (!bateriaId) {
      console.log('No bateria_id provided, fetching default bateria for modality');
      // Get the first available bateria for this modality/event
      const { data: bateriaResults, error: bateriaError } = await supabase
        .from('baterias')
        .select('id')
        .eq('modalidade_id', modalityId)
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

    // Prepare the complete record data with all required properties
    const recordData: ScoreRecordData = {
      evento_id: eventId,
      modalidade_id: modalityId,
      atleta_id: athlete.atleta_id,
      equipe_id: athlete.equipe_id || null,
      valor_pontuacao: finalScoreData.valor_pontuacao || null,
      unidade: finalScoreData.unidade || 'pontos',
      observacoes: finalScoreData.observacoes || null,
      juiz_id: finalScoreData.juiz_id,
      data_registro: finalScoreData.data_registro || new Date().toISOString(),
      bateria_id: bateriaId // This is now required
    };

    // Add optional time fields if they exist
    if (finalScoreData.tempo_minutos !== undefined && finalScoreData.tempo_minutos !== null) {
      recordData.tempo_minutos = finalScoreData.tempo_minutos;
    }
    if (finalScoreData.tempo_segundos !== undefined && finalScoreData.tempo_segundos !== null) {
      recordData.tempo_segundos = finalScoreData.tempo_segundos;
    }

    console.log('Record data to save:', recordData);
    
    // First, try to find existing record using a more explicit query
    const { data: existingRecords, error: fetchError } = await supabase
      .from('pontuacoes')
      .select('id')
      .eq('evento_id', eventId)
      .eq('modalidade_id', modalityId)
      .eq('atleta_id', athlete.atleta_id);
    
    if (fetchError) {
      console.error('Error checking for existing record:', fetchError);
      throw new Error(`Erro ao verificar pontuação existente: ${fetchError.message}`);
    }
    
    const existingRecord = existingRecords && existingRecords.length > 0 ? existingRecords[0] : null;
    
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
        throw new Error(`Erro ao atualizar pontuação: ${updateError.message}`);
      }
      
      result = updateData && updateData.length > 0 ? updateData[0] : null;
      operation = 'update';
    } else {
      // Insert new record
      console.log('Inserting new record');
      const { data: insertData, error: insertError } = await supabase
        .from('pontuacoes')
        .insert([recordData])
        .select('*');
      
      if (insertError) {
        console.error('Error in insert operation:', insertError);
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
    
    throw error;
  }
}
