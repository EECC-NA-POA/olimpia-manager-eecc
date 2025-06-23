
import { ScoreData } from '../types/scoreTypes';

export function processTempoScore(formData: any, rule?: any): ScoreData {
  console.log('Processing tempo score with form data:', formData);
  
  let scoreData: ScoreData = {
    valor_pontuacao: 0,
    unidade: 'tempo'
  };

  // Function to format time as mm:ss.SSS
  const formatTimeString = (minutes: number, seconds: number, milliseconds: number): string => {
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    const formattedMilliseconds = milliseconds.toString().padStart(3, '0');
    return `${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
  };

  // Handle baterias with individual time fields (tentativa_1_*)
  if ('tentativa_1_minutes' in formData || 'tentativa_1_seconds' in formData || 'tentativa_1_milliseconds' in formData) {
    const minutes = Number(formData.tentativa_1_minutes) || 0;
    const seconds = Number(formData.tentativa_1_seconds) || 0;
    const milliseconds = Number(formData.tentativa_1_milliseconds) || 0;
    
    const timeString = formatTimeString(minutes, seconds, milliseconds);
    
    console.log('Converting bateria time - minutes:', minutes, 'seconds:', seconds, 'milliseconds:', milliseconds, 'formatted:', timeString);
    
    scoreData = {
      valor_pontuacao: timeString as any, // Store as formatted string
      unidade: 'tempo'
    };
  } else if ('minutes' in formData && 'seconds' in formData && 'milliseconds' in formData) {
    // Handle standard time input
    const minutes = Number(formData.minutes) || 0;
    const seconds = Number(formData.seconds) || 0;
    const milliseconds = Number(formData.milliseconds) || 0;
    
    const timeString = formatTimeString(minutes, seconds, milliseconds);
    
    console.log('Converting standard time - minutes:', minutes, 'seconds:', seconds, 'milliseconds:', milliseconds, 'formatted:', timeString);
    
    scoreData = {
      valor_pontuacao: timeString as any, // Store as formatted string
      unidade: 'tempo'
    };
    
    if (formData.heat) {
      scoreData.bateria_id = formData.heat;
    }
  } else if ('score' in formData) {
    // Handle score-based time input - assume it's already in correct format or convert if numeric
    const score = formData.score;
    if (typeof score === 'number') {
      // Convert from seconds to mm:ss.SSS format
      const totalSeconds = score;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      const milliseconds = Math.floor((totalSeconds % 1) * 1000);
      
      scoreData = {
        valor_pontuacao: formatTimeString(minutes, seconds, milliseconds) as any,
        unidade: 'tempo'
      };
    } else {
      scoreData = {
        valor_pontuacao: score || '00:00.000',
        unidade: 'tempo'
      };
    }
    
    if (formData.heat) {
      scoreData.bateria_id = formData.heat;
    }
  }

  // Ensure we never return null or undefined for valor_pontuacao
  if (scoreData.valor_pontuacao === null || scoreData.valor_pontuacao === undefined) {
    console.warn('Invalid tempo value detected, setting to default');
    scoreData.valor_pontuacao = '00:00.000' as any;
  }

  console.log('Final tempo score data:', scoreData);
  return scoreData;
}
