
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
  console.log('Form data in scoreProcessor:', formData);

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

  console.log('Score data before validation:', scoreData);

  // CRITICAL: Ensure we ALWAYS have a valid valor_pontuacao - NEVER allow null or undefined
  if (scoreData.valor_pontuacao === undefined || 
      scoreData.valor_pontuacao === null || 
      isNaN(Number(scoreData.valor_pontuacao))) {
    console.error('CRITICAL: Invalid valor_pontuacao detected:', scoreData.valor_pontuacao);
    console.error('Original form data:', formData);
    console.error('Rule used:', rule);
    
    // Force a valid number - use 0 as fallback
    scoreData.valor_pontuacao = 0;
    console.warn('Forced valor_pontuacao to 0 to prevent database constraint violation');
  }

  // Ensure valor_pontuacao is always a number
  scoreData.valor_pontuacao = Number(scoreData.valor_pontuacao);

  console.log('Final processed score data:', scoreData);
  return scoreData;
}
