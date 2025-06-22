
import { parseTimeToMilliseconds, isTimeValue } from '@/utils/dynamicScoringUtils';

export interface AthleteScore {
  athleteId: string;
  athleteName: string;
  score: number;
  originalValue: string;
  placement?: number;
}

export function extractAthleteScores(
  athleteScores: Record<string, any>,
  referenceField: string
): AthleteScore[] {
  const scores: AthleteScore[] = [];
  
  for (const [athleteId, data] of Object.entries(athleteScores)) {
    if (!data || typeof data !== 'object') {
      console.log(`Dados inválidos para atleta ${athleteId}`);
      continue;
    }
    
    const rawValue = data[referenceField];
    const athleteName = data.athleteName || athleteId;
    
    console.log(`Processando atleta ${athleteName}:`);
    console.log(`  Campo: ${referenceField}`);
    console.log(`  Valor bruto:`, rawValue);
    console.log(`  Tipo do valor:`, typeof rawValue);
    
    if (rawValue === '' || rawValue === null || rawValue === undefined) {
      console.log(`  Pulando atleta - valor vazio`);
      continue;
    }
    
    let numericScore = 0;
    let originalValue = String(rawValue || '');
    
    // Processar diferentes tipos de valores
    if (typeof rawValue === 'string') {
      // Verificar se é um tempo formatado
      if (isTimeValue(rawValue)) {
        numericScore = parseTimeToMilliseconds(rawValue);
        console.log(`  Tempo convertido: ${rawValue} -> ${numericScore}ms`);
      } else {
        // Tentar converter string para número
        const cleanValue = rawValue.replace(/[^\d.,]/g, '').replace(',', '.');
        numericScore = parseFloat(cleanValue) || 0;
        console.log(`  String convertida: ${rawValue} -> ${numericScore}`);
      }
    } else if (typeof rawValue === 'number') {
      numericScore = rawValue;
      console.log(`  Número direto: ${numericScore}`);
    }
    
    if (numericScore > 0) {
      scores.push({
        athleteId,
        athleteName,
        score: numericScore,
        originalValue
      });
      console.log(`  ✓ Adicionado: ${numericScore}`);
    } else {
      console.log(`  ✗ Valor inválido: ${numericScore}`);
    }
  }

  return scores;
}
