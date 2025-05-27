
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

  // Add time fields if they exist
  if (scoreData.tempo_minutos !== undefined) {
    finalData.tempo_minutos = scoreData.tempo_minutos;
  }
  if (scoreData.tempo_segundos !== undefined) {
    finalData.tempo_segundos = scoreData.tempo_segundos;
  }
  if (scoreData.tempo_milissegundos !== undefined) {
    finalData.tempo_milissegundos = scoreData.tempo_milissegundos;
  }

  // Add bateria_id if it exists
  if (scoreData.bateria_id !== undefined) {
    finalData.bateria_id = scoreData.bateria_id;
  }

  console.log('Final score data prepared:', finalData);
  return finalData;
}
