
export function useDynamicScoringFieldValues(
  existingScores: any[],
  editValues: Record<string, any>
) {
  const getFieldValue = (athleteId: string, fieldKey: string) => {
    // Always check edit values first (for when user is editing)
    const editValue = editValues[athleteId]?.[fieldKey];
    if (editValue !== undefined) {
      console.log(`Getting field value for ${athleteId}.${fieldKey}: ${editValue} (from edit values)`);
      return editValue;
    }
    
    // Then check existing scores (for display when not editing)
    const existingScore = existingScores.find(s => s.atleta_id === athleteId);
    const tentativa = existingScore?.tentativas?.[fieldKey];
    const existingValue = tentativa?.valor_formatado || tentativa?.valor || '';
    console.log(`Getting field value for ${athleteId}.${fieldKey}: ${existingValue} (from existing scores)`);
    return existingValue;
  };

  const getDisplayValue = (athleteId: string, fieldKey: string) => {
    const existingScore = existingScores.find(s => s.atleta_id === athleteId);
    const tentativa = existingScore?.tentativas?.[fieldKey];
    return tentativa?.valor_formatado || tentativa?.valor || '-';
  };

  const hasExistingScore = (athleteId: string) => {
    const existingScore = existingScores.find(s => s.atleta_id === athleteId);
    const hasScore = existingScore && Object.keys(existingScore.tentativas || {}).length > 0;
    console.log(`Athlete ${athleteId} has existing score:`, hasScore);
    return hasScore;
  };

  return {
    getFieldValue,
    getDisplayValue,
    hasExistingScore
  };
}
