
import { AthleteData, ScoreRecordData } from './types';
import { getModalityInfo, getTeamId, getBateriaId } from './modalityUtils';
import { handleTeamScore } from './teamScoreHandler';
import { handleIndividualScore } from './individualScoreHandler';
import { handleDatabaseError } from './errorHandler';

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
    
    // Get modality information
    const { isTeamModality } = await getModalityInfo(modalityIdInt);
    
    // Get team ID if needed
    const teamId = await getTeamId(athlete, modalityIdInt, eventId, isTeamModality);
    
    // Get bateria ID FIRST - this will process and remove the _heat field
    const bateriaId = await getBateriaId(finalScoreData, modalityIdInt, eventId);

    // Prepare the complete record data with explicit type conversion
    // Note: _heat field should be removed by getBateriaId at this point
    const recordData: ScoreRecordData = {
      evento_id: eventId,
      modalidade_id: modalityIdInt,
      atleta_id: athlete.atleta_id,
      equipe_id: teamId || null,
      valor_pontuacao: finalScoreData.valor_pontuacao || null,
      unidade: finalScoreData.unidade || 'pontos',
      observacoes: finalScoreData.observacoes || null,
      juiz_id: finalScoreData.juiz_id,
      data_registro: finalScoreData.data_registro || new Date().toISOString(),
      numero_bateria: bateriaId
    };

    console.log('Record data to save:', JSON.stringify(recordData, null, 2));
    
    // Choose the correct approach based on modality type
    if (isTeamModality) {
      console.log('TEAM MODALITY: Using team score handling');
      return await handleTeamScore(recordData, eventId, modalityIdInt, teamId);
    } else {
      console.log('INDIVIDUAL MODALITY: Using individual score handling');
      return await handleIndividualScore(recordData, eventId, modalityIdInt);
    }
    
  } catch (error: any) {
    handleDatabaseError(error);
  }
}
