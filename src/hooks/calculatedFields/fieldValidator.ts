
import { CampoModelo } from '@/types/dynamicScoring';

export function canCalculateField(campo: CampoModelo, existingScores: any[]): boolean {
  if (!campo.metadados?.campo_referencia) return false;

  // Check if there's enough data in the reference field
  const scoresWithReferenceField = existingScores.filter(score => 
    score.tentativas_pontuacao?.some(
      (tentativa: any) => tentativa.chave_campo === campo.metadados?.campo_referencia
    )
  );

  return scoresWithReferenceField.length > 1; // Need at least 2 athletes to calculate placement
}
