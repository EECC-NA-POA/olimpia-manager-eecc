
import { CampoModelo, CalculationResult } from '@/types/dynamicScoring';
import { parseValueByFormat } from '@/components/judge/dynamic-scoring/utils/maskUtils';
import { PlacementCalculationParams, ScoreWithReference } from './types';

export async function calculatePlacement({
  campo,
  existingScores,
  allFields
}: PlacementCalculationParams): Promise<CalculationResult[]> {
  const referenceField = campo.metadados?.campo_referencia;
  const ordemCalculo = campo.metadados?.ordem_calculo || 'asc';
  
  if (!referenceField) {
    throw new Error('Campo de referência não definido');
  }

  // Find reference field to determine format
  const referenceCampo = allFields.find(f => f.chave_campo === referenceField);
  const formatoReferencia = referenceCampo?.metadados?.formato_resultado;

  // Get all values from reference field
  const scoresWithReference = existingScores
    .map(score => {
      const tentativa = score.tentativas_pontuacao?.find(
        (t: any) => t.chave_campo === referenceField
      );
      
      if (!tentativa) return null;

      // Parse value based on field format
      const parsedValue = parseValueByFormat(tentativa.valor.toString(), formatoReferencia);
      
      return {
        atleta_id: score.atleta_id,
        valor: parsedValue.numericValue,
        valorOriginal: tentativa.valor,
        bateria_id: score.bateria_id
      } as ScoreWithReference;
    })
    .filter((item): item is ScoreWithReference => item !== null);

  if (scoresWithReference.length === 0) {
    throw new Error('Nenhum dado encontrado para calcular colocação');
  }

  // Sort based on calculation order
  const sortedScores = [...scoresWithReference].sort((a, b) => {
    if (ordemCalculo === 'asc') {
      return a.valor - b.valor; // Lower value = better position
    } else {
      return b.valor - a.valor; // Higher value = better position
    }
  });

  // Calculate placements (considering ties)
  const results: CalculationResult[] = [];
  let currentPosition = 1;
  let previousValue: number | null = null;

  sortedScores.forEach((score, index) => {
    if (previousValue === null || score.valor !== previousValue) {
      currentPosition = index + 1;
    }
    
    results.push({
      chave_campo: campo.chave_campo,
      atleta_id: score.atleta_id,
      valor_calculado: currentPosition,
      metodo_calculo: `${campo.metadados?.tipo_calculo}_${ordemCalculo}_${formatoReferencia || 'numeric'}`
    });
    
    previousValue = score.valor;
  });

  return results;
}
