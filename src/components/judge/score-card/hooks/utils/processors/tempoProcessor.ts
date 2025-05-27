
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
    
    console.log('Processing tentativa (time fields):', { minutes, seconds, milliseconds });
    
    // Convert everything to total seconds for storage
    const totalSeconds = (minutes * 60) + seconds + (milliseconds / 1000);
    
    scoreData = {
      valor_pontuacao: totalSeconds,
      unidade: 'segundos'
    };
  } else if ('minutes' in formData) {
    // Handle standard time input
    const minutes = Number(formData.minutes) || 0;
    const seconds = Number(formData.seconds) || 0;
    const milliseconds = Number(formData.milliseconds) || 0;
    
    // Convert everything to total seconds for storage
    const totalSeconds = (minutes * 60) + seconds + (milliseconds / 1000);
    
    scoreData = {
      valor_pontuacao: totalSeconds,
      unidade: 'segundos'
    };
    
    if (formData.heat) {
      scoreData.bateria_id = formData.heat;
    }
  } else {
    // Default time values
    scoreData = {
      valor_pontuacao: 0,
      unidade: 'segundos'
    };
  }

  return scoreData;
}
