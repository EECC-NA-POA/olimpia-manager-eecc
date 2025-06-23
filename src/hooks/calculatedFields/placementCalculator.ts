
import { CampoModelo, CalculationResult } from '@/types/dynamicScoring';
import { parseValueByFormat } from '@/components/judge/dynamic-scoring/utils/maskUtils';
import { PlacementCalculationParams, ScoreWithReference } from './types';
import { supabase } from '@/lib/supabase';

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

  // Get participating athletes only
  const participatingAthletes = await getParticipatingAthletes(existingScores);

  // Get all values from reference field for participating athletes only
  const scoresWithReference = existingScores
    .filter(score => participatingAthletes.includes(score.atleta_id))
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
    throw new Error('Nenhum dado encontrado para calcular colocação dos atletas participantes');
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
      metodo_calculo: `${campo.metadados?.tipo_calculo}_${ordemCalculo}_${formatoReferencia || 'numeric'}_participating_only`
    });
    
    previousValue = score.valor;
  });

  return results;
}

async function getParticipatingAthletes(existingScores: any[]): Promise<string[]> {
  if (existingScores.length === 0) return [];
  
  const firstScore = existingScores[0];
  const modalityId = firstScore.modalidade_id;
  const eventId = firstScore.evento_id;
  const bateriaId = firstScore.bateria_id;

  let query = supabase
    .from('participacao_atletas')
    .select('atleta_id')
    .eq('modalidade_id', modalityId)
    .eq('evento_id', eventId)
    .eq('participando', true);

  if (bateriaId) {
    query = query.eq('bateria_id', bateriaId);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching participating athletes:', error);
    // If there's an error or no participation data, assume all athletes are participating
    return existingScores.map(score => score.atleta_id);
  }

  const participatingIds = data?.map(p => p.atleta_id) || [];
  
  // If no participation records found, assume all athletes are participating
  if (participatingIds.length === 0) {
    return existingScores.map(score => score.atleta_id);
  }

  return participatingIds;
}
