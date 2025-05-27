
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
  bateria_id?: number;
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
    // Prepare the complete record data with all possible properties
    const recordData: ScoreRecordData = {
      evento_id: eventId,
      modalidade_id: modalityId,
      atleta_id: athlete.atleta_id,
      equipe_id: athlete.equipe_id || null,
      valor_pontuacao: finalScoreData.valor_pontuacao || null,
      unidade: finalScoreData.unidade || 'pontos',
      observacoes: finalScoreData.observacoes || null,
      juiz_id: finalScoreData.juiz_id,
      data_registro: finalScoreData.data_registro || new Date().toISOString()
    };

    // Add optional time fields if they exist
    if (finalScoreData.tempo_minutos !== undefined && finalScoreData.tempo_minutos !== null) {
      recordData.tempo_minutos = finalScoreData.tempo_minutos;
    }
    if (finalScoreData.tempo_segundos !== undefined && finalScoreData.tempo_segundos !== null) {
      recordData.tempo_segundos = finalScoreData.tempo_segundos;
    }
    if (finalScoreData.bateria_id !== undefined && finalScoreData.bateria_id !== null) {
      recordData.bateria_id = finalScoreData.bateria_id;
    }

    console.log('Record data to save:', recordData);
    
    // First, try to find existing record
    const { data: existingRecord, error: fetchError } = await supabase
      .from('pontuacoes')
      .select('id')
      .eq('evento_id', eventId)
      .eq('modalidade_id', modalityId)
      .eq('atleta_id', athlete.atleta_id)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error checking for existing record:', fetchError);
      throw new Error(`Erro ao verificar pontuação existente: ${fetchError.message}`);
    }
    
    let result;
    let operation;
    
    if (existingRecord) {
      // Update existing record
      console.log('Updating existing record with ID:', existingRecord.id);
      const { data, error } = await supabase
        .from('pontuacoes')
        .update(recordData)
        .eq('id', existingRecord.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error in update operation:', error);
        throw new Error(`Erro ao atualizar pontuação: ${error.message}`);
      }
      
      result = data;
      operation = 'update';
    } else {
      // Insert new record
      console.log('Inserting new record');
      const { data, error } = await supabase
        .from('pontuacoes')
        .insert(recordData)
        .select()
        .single();
      
      if (error) {
        console.error('Error in insert operation:', error);
        throw new Error(`Erro ao inserir pontuação: ${error.message}`);
      }
      
      result = data;
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
