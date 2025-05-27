
import { ScoreData } from '../types/scoreTypes';

export function processTempoScore(formData: any, rule?: any): ScoreData {
  console.log('Processing tempo score with form data:', formData);
  
  let scoreData: ScoreData = {
    valor_pontuacao: 0,
    unidade: 'segundos'
  };

  // Handle baterias with individual time fields (tentativa_1_*)
  if ('tentativa_1_minutes' in formData || 'tentativa_1_seconds' in formData || 'tentativa_1_milliseconds' in formData) {
    const minutes = Number(formData.tentativa_1_minutes) || 0;
    const seconds = Number(formData.tentativa_1_seconds) || 0;
    const milliseconds = Number(formData.tentativa_1_milliseconds) || 0;
    const raia = formData.tentativa_1_raia;
    
    console.log('Processing tentativa (time fields):', { minutes, seconds, milliseconds, raia });
    
    const totalSeconds = (minutes * 60) + seconds + (milliseconds / 1000);
    
    scoreData = {
      valor_pontuacao: totalSeconds,
      unidade: 'segundos',
      tempo_minutos: minutes,
      tempo_segundos: seconds,
      tempo_milissegundos: milliseconds
    };
    
    if (raia) {
      scoreData.raia = parseInt(raia);
    }
  } else if ('minutes' in formData) {
    // Handle standard time input
    const minutes = Number(formData.minutes) || 0;
    const seconds = Number(formData.seconds) || 0;
    const milliseconds = Number(formData.milliseconds) || 0;
    
    const totalSeconds = (minutes * 60) + seconds + (milliseconds / 1000);
    
    scoreData = {
      valor_pontuacao: totalSeconds,
      unidade: 'segundos',
      tempo_minutos: minutes,
      tempo_segundos: seconds,
      tempo_milissegundos: milliseconds
    };
    
    if (formData.heat) {
      scoreData.bateria_id = formData.heat;
    }
    
    if (formData.lane) {
      scoreData.raia = formData.lane;
    }
  } else {
    // Default time values
    scoreData = {
      valor_pontuacao: 0,
      unidade: 'segundos',
      tempo_minutos: 0,
      tempo_segundos: 0,
      tempo_milissegundos: 0
    };
  }

  return scoreData;
}
