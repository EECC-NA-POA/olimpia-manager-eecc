
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
    .select('id, valor_pontuacao, unidade, observacoes, tempo_minutos, tempo_segundos')
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
    const { data: updateData, error: updateError } = await supabase
      .from('pontuacoes')
      .update({
        valor_pontuacao: recordData.valor_pontuacao,
        unidade: recordData.unidade,
        observacoes: recordData.observacoes,
        juiz_id: recordData.juiz_id,
        data_registro: recordData.data_registro,
        ...(recordData.tempo_minutos !== undefined && { tempo_minutos: recordData.tempo_minutos }),
        ...(recordData.tempo_segundos !== undefined && { tempo_segundos: recordData.tempo_segundos })
      })
      .eq('id', existingRecord.id)
      .select('*');
    
    if (updateError) {
      console.error('Error in update operation:', updateError);
      throw new Error(`Erro ao atualizar pontuação: ${updateError.message}`);
    }
    
    result = updateData && updateData.length > 0 ? updateData[0] : null;
    operation = 'update';
  } else {
    // Insert new record for this bateria
    console.log('Inserting new individual record for bateria:', recordData.bateria_id);
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
  
  console.log('Individual score saved successfully for bateria:', recordData.bateria_id, result ? 'Success' : 'No data returned');
  return { 
    success: true, 
    data: result, 
    operation: operation 
  };
}
