
import { supabase } from '@/lib/supabase';
import { ScoreRecordData, SaveScoreResult } from './types';

export async function handleIndividualScore(
  recordData: ScoreRecordData,
  eventId: string,
  modalityIdInt: number
): Promise<SaveScoreResult> {
  console.log('Handling individual score for bateria:', recordData.bateria_id);
  
  // Check for existing record for this specific bateria
  const { data: existingRecords, error: fetchError } = await supabase
    .from('pontuacoes')
    .select('id, valor_pontuacao, unidade, observacoes')
    .eq('evento_id', eventId)
    .eq('modalidade_id', modalityIdInt)
    .eq('atleta_id', recordData.atleta_id)
    .eq('bateria_id', recordData.bateria_id);
  
  if (fetchError) {
    console.error('Error checking for existing record:', fetchError);
    throw new Error(`Erro ao verificar pontuação existente: ${fetchError.message}`);
  }
  
  const existingRecord = existingRecords && existingRecords.length > 0 ? existingRecords[0] : null;
  console.log('Existing record found for bateria', recordData.bateria_id, ':', existingRecord ? 'Yes' : 'No');
  
  let result;
  let operation;
  
  if (existingRecord) {
    // Update existing record for this specific bateria
    console.log('Updating existing individual record for bateria:', recordData.bateria_id);
    const updateData: any = {
      valor_pontuacao: recordData.valor_pontuacao,
      unidade: recordData.unidade,
      observacoes: recordData.observacoes,
      juiz_id: recordData.juiz_id,
      data_registro: recordData.data_registro
    };

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
    // Insert new record for this bateria
    console.log('Inserting new individual record for bateria:', recordData.bateria_id);
    
    const insertData: any = {
      evento_id: recordData.evento_id,
      modalidade_id: recordData.modalidade_id,
      atleta_id: recordData.atleta_id,
      equipe_id: recordData.equipe_id,
      valor_pontuacao: recordData.valor_pontuacao,
      unidade: recordData.unidade,
      observacoes: recordData.observacoes,
      juiz_id: recordData.juiz_id,
      data_registro: recordData.data_registro,
      bateria_id: recordData.bateria_id
    };

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
  
  console.log('Individual score saved successfully for bateria:', recordData.bateria_id, result ? 'Success' : 'No data returned');
  return { 
    success: true, 
    data: result, 
    operation: operation 
  };
}
