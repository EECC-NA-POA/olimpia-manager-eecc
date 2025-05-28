
import { AthleteData } from '../types/scoreTypes';

export function prepareFinalScoreData(
  scoreData: any,
  formData: any,
  judgeId: string,
  eventId: string,
  modalityId: number,
  athlete: AthleteData
) {
  const finalData: any = {
    valor_pontuacao: scoreData.valor_pontuacao,
    unidade: scoreData.unidade,
    observacoes: formData.notes || null,
    juiz_id: judgeId,
    data_registro: new Date().toISOString(),
    evento_id: eventId,
    modalidade_id: modalityId,
    atleta_id: athlete.atleta_id,
    equipe_id: athlete.equipe_id || null
  };

  // Add bateria_id if it exists in scoreData
  if (scoreData.bateria_id !== undefined) {
    finalData.bateria_id = scoreData.bateria_id;
  }
  
  // Add heat number if it exists in formData (this will be converted to bateria_id later)
  if (formData.heat !== undefined) {
    finalData.heat = formData.heat;
  }

  console.log('Final score data prepared:', finalData);
  return finalData;
}
