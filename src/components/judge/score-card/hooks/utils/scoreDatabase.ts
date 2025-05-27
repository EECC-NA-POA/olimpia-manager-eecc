
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
    // Prepare the complete record data
    const recordData = {
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
    
    // Use upsert to handle both insert and update in one operation
    const { data, error } = await supabase
      .from('pontuacoes')
      .upsert(recordData, {
        onConflict: 'evento_id,modalidade_id,atleta_id',
        ignoreDuplicates: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error in upsert operation:', error);
      throw new Error(`Erro ao salvar pontuação: ${error.message}`);
    }
    
    console.log('Score saved successfully:', data);
    return { 
      success: true, 
      data: data, 
      operation: 'upsert' 
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
