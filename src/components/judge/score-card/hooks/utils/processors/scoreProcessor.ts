
import { ScoreData, PreparedScoreResult } from '../types/scoreTypes';
import { processTempoScore } from './tempoProcessor';
import { processDistanciaScore } from './distanciaProcessor';
import { processPontosScore } from './pontosProcessor';

export function processScoreByType(
  formData: any,
  modalityRule: any,
  scoreType: 'tempo' | 'distancia' | 'pontos'
): ScoreData {
  const rule = modalityRule;
  const effectiveType = rule?.regra_tipo || scoreType;
  
  console.log('Processing score with effective type:', effectiveType);
  console.log('Rule parameters:', rule?.parametros);

  let scoreData: ScoreData;

  // Handle "baterias" rule type with specific units
  if (rule?.parametros?.baterias === true) {
    console.log('Processing baterias rule for rule type:', rule.regra_tipo);
    
    switch (rule.regra_tipo) {
      case 'tempo':
        scoreData = processTempoScore(formData, rule);
        break;
      case 'distancia':
        scoreData = processDistanciaScore(formData, rule);
        break;
      default:
        scoreData = processPontosScore(formData, rule);
        break;
    }
  } else {
    // Handle regular scoring without baterias
    switch (effectiveType) {
      case 'tempo':
        scoreData = processTempoScore(formData, rule);
        break;
      case 'distancia':
        scoreData = processDistanciaScore(formData, rule);
        break;
      default:
        scoreData = processPontosScore(formData, rule);
        break;
    }
  }

  // Ensure we ALWAYS have a valid valor_pontuacao - NEVER allow null
  if (scoreData.valor_pontuacao === undefined || scoreData.valor_pontuacao === null || isNaN(scoreData.valor_pontuacao)) {
    console.log('Invalid valor_pontuacao found, setting to 0');
    scoreData.valor_pontuacao = 0;
  }

  return scoreData;
}
