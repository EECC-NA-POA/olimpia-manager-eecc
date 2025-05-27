
import { ScoreData } from '../types/scoreTypes';

export function processPontosScore(formData: any, rule?: any): ScoreData {
  console.log('Processing pontos score with form data:', formData);
  
  let scoreData: ScoreData = {
    valor_pontuacao: 0,
    unidade: 'pontos'
  };

  // Handle baterias with individual score fields (tentativa_1_*)
  if ('tentativa_1_score' in formData) {
    const score = Number(formData.tentativa_1_score) || 0;
    const raia = formData.tentativa_1_raia;
    
    scoreData = {
      valor_pontuacao: score,
      unidade: 'pontos'
    };
    
    if (raia) {
      scoreData.raia = parseInt(raia);
    }
  } else {
    // Handle standard points input
    scoreData = {
      valor_pontuacao: Number(formData.score) || 0,
      unidade: 'pontos'
    };
    
    if (formData.heat) {
      scoreData.bateria_id = formData.heat;
    }
    if (formData.lane) {
      scoreData.raia = formData.lane;
    }
  }

  return scoreData;
}
