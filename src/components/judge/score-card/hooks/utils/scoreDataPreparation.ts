
import { ModalityRule } from '../../../tabs/scores/hooks/useModalityRules';

interface AthleteData {
  atleta_id: string;
  equipe_id?: number;
}

export function prepareScoreData(
  formData: any,
  modalityRule: any,
  scoreType: 'tempo' | 'distancia' | 'pontos'
) {
  console.log('Form data received:', formData);
  console.log('Modality rule:', modalityRule);
  
  const rule = modalityRule;
  let scoreData: any = {};
  
  if (rule?.regra_tipo === 'distancia' || scoreType === 'distancia') {
    if ('meters' in formData && 'centimeters' in formData) {
      const totalMeters = formData.meters + (formData.centimeters / 100);
      scoreData = {
        valor_pontuacao: totalMeters,
        unidade: 'm'
      };
      
      if (formData.heat) {
        scoreData.bateria_id = formData.heat;
      }
    } else if ('score' in formData) {
      scoreData = {
        valor_pontuacao: formData.score,
        unidade: 'm'
      };
      
      if (formData.heat) {
        scoreData.bateria_id = formData.heat;
      }
    }
  } else if (rule?.regra_tipo === 'tempo' || scoreType === 'tempo') {
    if ('minutes' in formData) {
      const totalMs = (formData.minutes * 60 * 1000) + (formData.seconds * 1000) + formData.milliseconds;
      scoreData = {
        valor_pontuacao: totalMs,
        unidade: 'ms',
        tempo_minutos: formData.minutes,
        tempo_segundos: formData.seconds,
        tempo_milissegundos: formData.milliseconds
      };
      
      if (formData.heat) {
        scoreData.bateria_id = formData.heat;
      }
    }
  } else {
    scoreData = {
      valor_pontuacao: formData.score || 0,
      unidade: 'pontos'
    };
    
    if (formData.heat) {
      scoreData.bateria_id = formData.heat;
    }
  }
  
  if (!scoreData.valor_pontuacao && scoreData.valor_pontuacao !== 0) {
    throw new Error('Failed to prepare score data - missing valor_pontuacao');
  }
  
  console.log('Prepared score data:', scoreData);
  
  return { scoreData };
}

export function prepareFinalScoreData(
  scoreData: any,
  formData: any,
  judgeId: string,
  eventId: string,
  modalityId: number,
  athlete: AthleteData
) {
  const finalData = {
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

  // Add optional fields only if they exist
  if (scoreData.tempo_minutos !== undefined) {
    finalData.tempo_minutos = scoreData.tempo_minutos;
  }
  if (scoreData.tempo_segundos !== undefined) {
    finalData.tempo_segundos = scoreData.tempo_segundos;
  }
  if (scoreData.tempo_milissegundos !== undefined) {
    finalData.tempo_milissegundos = scoreData.tempo_milissegundos;
  }
  if (scoreData.bateria_id !== undefined) {
    finalData.bateria_id = scoreData.bateria_id;
  }

  console.log('Final score data prepared:', finalData);
  return finalData;
}
