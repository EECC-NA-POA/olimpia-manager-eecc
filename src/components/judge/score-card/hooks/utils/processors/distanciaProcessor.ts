
import { ScoreData } from '../types/scoreTypes';

export function processDistanciaScore(formData: any, rule?: any): ScoreData {
  console.log('Processing distancia score with form data:', formData);
  
  let scoreData: ScoreData = {
    valor_pontuacao: 0,
    unidade: 'm'
  };

  // Handle baterias with individual distance fields (tentativa_1_*)
  if ('tentativa_1_meters' in formData || 'tentativa_1_centimeters' in formData) {
    const meters = Number(formData.tentativa_1_meters) || 0;
    const centimeters = Number(formData.tentativa_1_centimeters) || 0;
    const raia = formData.tentativa_1_raia;
    
    const totalMeters = meters + (centimeters / 100);
    
    scoreData = {
      valor_pontuacao: totalMeters,
      unidade: 'm'
    };
    
    if (raia) {
      scoreData.raia = parseInt(raia);
    }
  } else if ('meters' in formData && 'centimeters' in formData) {
    // Handle standard distance input
    const totalMeters = Number(formData.meters) + (Number(formData.centimeters) / 100);
    scoreData = {
      valor_pontuacao: totalMeters,
      unidade: 'm'
    };
    
    if (formData.heat) {
      scoreData.bateria_id = formData.heat;
    }
    if (formData.lane) {
      scoreData.raia = formData.lane;
    }
  } else if ('score' in formData) {
    // Handle score-based distance input
    scoreData = {
      valor_pontuacao: Number(formData.score) || 0,
      unidade: 'm'
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
