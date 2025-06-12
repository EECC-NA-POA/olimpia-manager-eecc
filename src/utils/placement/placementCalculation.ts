
import { AthleteScore } from './scoreProcessing';
import { isTimeValue } from '@/utils/dynamicScoringUtils';
import { CampoModelo } from '@/types/dynamicScoring';

export function calculatePlacements(
  scores: AthleteScore[],
  calculatedField: CampoModelo
): AthleteScore[] {
  // Ordenar baseado no tipo de ordenação configurado
  const ordem = calculatedField.metadados?.ordem_calculo || 'desc';
  console.log('Ordem de cálculo configurada:', ordem);
  
  // Para tempos, geralmente queremos ordem crescente (menor tempo = melhor)
  // Para pontos, geralmente queremos ordem decrescente (maior pontos = melhor)
  const isTimeField = scores.some(s => isTimeValue(s.originalValue));
  const effectiveOrder = isTimeField ? 'asc' : ordem;
  
  console.log('Ordem efetiva (considerando se é tempo):', effectiveOrder);
  
  scores.sort((a, b) => {
    if (effectiveOrder === 'asc') {
      return a.score - b.score; // Menor valor = melhor colocação
    } else {
      return b.score - a.score; // Maior valor = melhor colocação
    }
  });

  console.log('Pontuações ordenadas:');
  scores.forEach((s, i) => console.log(`${i + 1}. ${s.athleteName}: ${s.originalValue} (${s.score})`));

  // Atribuir colocações (tratando empates)
  let currentPlacement = 1;
  for (let i = 0; i < scores.length; i++) {
    if (i > 0 && scores[i].score !== scores[i - 1].score) {
      currentPlacement = i + 1;
    }
    scores[i].placement = currentPlacement;
    console.log(`${scores[i].athleteName}: ${scores[i].originalValue} = ${currentPlacement}º lugar`);
  }

  return scores;
}
