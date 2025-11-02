
import { supabase } from '@/lib/supabase';
import { ScoreRecordData, SaveScoreResult } from './types';

export async function handleIndividualScore(
  recordData: ScoreRecordData,
  eventId: string,
  modalityIdInt: number
): Promise<SaveScoreResult> {
  console.log('Handling individual score');
  
  // Check for existing record
  const { data: existingRecords, error: fetchError } = await supabase
    .from('pontuacoes')
    .select('id, observacoes')
    .eq('evento_id', eventId)
    .eq('modalidade_id', modalityIdInt)
    .eq('atleta_id', recordData.atleta_id);
  
  if (fetchError) {
    console.error('Error checking for existing record:', fetchError);
    throw new Error(`Erro ao verificar pontuação existente: ${fetchError.message}`);
  }
  
  const existingRecord = existingRecords && existingRecords.length > 0 ? existingRecords[0] : null;
  console.log('Existing record found:', existingRecord ? 'Yes' : 'No');
  
  let result;
  let operation;
  
  if (existingRecord) {
    // Update existing record
    console.log('Updating existing individual record');
    const updateData: any = {
      observacoes: recordData.observacoes,
      juiz_id: recordData.juiz_id,
      data_registro: recordData.data_registro
    };

    if (recordData.modelo_id) {
      updateData.modelo_id = recordData.modelo_id;
    }

    const { data: updateResult, error: updateError } = await supabase
      .from('pontuacoes')
      .update(updateData)
      .eq('id', existingRecord.id)
      .select('*');
    
    if (updateError) {
      console.error('Error in update operation:', updateError);
      throw new Error(`Erro ao atualizar pontuação: ${updateError.message}`);
    }
    
    result = updateResult && updateResult.length > 0 ? updateResult[0] : null;
    operation = 'update';
  } else {
    // Insert new record
    console.log('Inserting new individual record');
    
    const insertData: any = {
      evento_id: recordData.evento_id,
      modalidade_id: recordData.modalidade_id,
      atleta_id: recordData.atleta_id,
      equipe_id: recordData.equipe_id,
      observacoes: recordData.observacoes,
      juiz_id: recordData.juiz_id,
      data_registro: recordData.data_registro
    };

    if (recordData.modelo_id) {
      insertData.modelo_id = recordData.modelo_id;
    }

    const { data: insertResult, error: insertError } = await supabase
      .from('pontuacoes')
      .insert([insertData])
      .select('*');
    
    if (insertError) {
      console.error('Error in insert operation:', insertError);
      throw new Error(`Erro ao inserir pontuação: ${insertError.message}`);
    }
    
    result = insertResult && insertResult.length > 0 ? insertResult[0] : null;
    operation = 'insert';
  }
  
  console.log('Individual score saved successfully:', result ? 'Success' : 'No data returned');
  return { 
    success: true, 
    data: result, 
    operation: operation 
  };
}
