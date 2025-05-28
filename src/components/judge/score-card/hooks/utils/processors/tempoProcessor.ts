
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
    
    // Convert everything to seconds with decimal precision
    const totalSeconds = (minutes * 60) + seconds + (milliseconds / 1000);
    
    console.log('Converting bateria time - minutes:', minutes, 'seconds:', seconds, 'milliseconds:', milliseconds, 'total:', totalSeconds);
    
    scoreData = {
      valor_pontuacao: totalSeconds,
      unidade: 'segundos'
    };
  } else if ('minutes' in formData && 'seconds' in formData && 'milliseconds' in formData) {
    // Handle standard time input
    const minutes = Number(formData.minutes) || 0;
    const seconds = Number(formData.seconds) || 0;
    const milliseconds = Number(formData.milliseconds) || 0;
    
    // Convert everything to seconds with decimal precision
    const totalSeconds = (minutes * 60) + seconds + (milliseconds / 1000);
    
    console.log('Converting standard time - minutes:', minutes, 'seconds:', seconds, 'milliseconds:', milliseconds, 'total:', totalSeconds);
    
    scoreData = {
      valor_pontuacao: totalSeconds,
      unidade: 'segundos'
    };
    
    if (formData.heat) {
      scoreData.bateria_id = formData.heat;
    }
  } else if ('score' in formData) {
    // Handle score-based time input
    scoreData = {
      valor_pontuacao: Number(formData.score) || 0,
      unidade: 'segundos'
    };
    
    if (formData.heat) {
      scoreData.bateria_id = formData.heat;
    }
  }

  // Ensure we never return null or undefined for valor_pontuacao
  if (scoreData.valor_pontuacao === null || scoreData.valor_pontuacao === undefined || isNaN(scoreData.valor_pontuacao)) {
    console.warn('Invalid tempo value detected, setting to 0');
    scoreData.valor_pontuacao = 0;
  }

  console.log('Final tempo score data:', scoreData);
  return scoreData;
}
