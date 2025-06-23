
import { AthleteScore } from './scoreProcessing';
import { isTimeValue } from '@/utils/dynamicScoringUtils';
import { CampoModelo } from '@/types/dynamicScoring';

export function calculatePlacements(
  scores: AthleteScore[],
  calculatedField: CampoModelo
): AthleteScore[] {
  console.log('=== INICIANDO CÁLCULO DE COLOCAÇÕES ===');
  console.log('Pontuações recebidas:', scores.length);
  
  if (scores.length === 0) {
    console.log('Nenhuma pontuação válida para calcular');
    return [];
  }

  // Ordenar baseado no tipo de ordenação configurado
  const ordem = calculatedField.metadados?.ordem_calculo || 'desc';
  console.log('Ordem de cálculo configurada:', ordem);
  
  // Para tempos, geralmente queremos ordem crescente (menor tempo = melhor)
  // Para pontos, geralmente queremos ordem decrescente (maior pontos = melhor)
  const isTimeField = scores.some(s => isTimeValue(s.originalValue));
  const effectiveOrder = isTimeField ? 'asc' : ordem;
  
  console.log('Ordem efetiva (considerando se é tempo):', effectiveOrder);
  console.log('É campo de tempo?', isTimeField);
  
  // Ordenar pontuações
  scores.sort((a, b) => {
    if (effectiveOrder === 'asc') {
      return a.score - b.score; // Menor valor = melhor colocação
    } else {
      return b.score - a.score; // Maior valor = melhor colocação
    }
  });

  console.log('Pontuações ordenadas:');
  scores.forEach((s, i) => {
    console.log(`${i + 1}. ${s.athleteName}: ${s.originalValue} (score: ${s.score})`);
  });

  // Atribuir colocações tratando empates corretamente
  // Só atletas com pontuações EXATAMENTE iguais recebem a mesma colocação
  let currentPlacement = 1;
  
  for (let i = 0; i < scores.length; i++) {
    // Se não é o primeiro atleta E a pontuação é diferente da anterior
    if (i > 0 && scores[i].score !== scores[i - 1].score) {
      currentPlacement = i + 1; // Próxima colocação baseada na posição
    }
    
    scores[i].placement = currentPlacement;
    
    console.log(`Colocação atribuída: ${scores[i].athleteName} = ${currentPlacement}º lugar (score: ${scores[i].score})`);
  }

  console.log('=== CÁLCULO DE COLOCAÇÕES CONCLUÍDO ===');
  console.log('Total de atletas classificados:', scores.length);
  
  // Verificar se há empates e logar
  const placementCounts = scores.reduce((acc, s) => {
    acc[s.placement!] = (acc[s.placement!] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  Object.entries(placementCounts).forEach(([placement, count]) => {
    if (count > 1) {
      console.log(`Empate detectado: ${count} atletas na ${placement}ª colocação`);
    }
  });

  return scores;
}
