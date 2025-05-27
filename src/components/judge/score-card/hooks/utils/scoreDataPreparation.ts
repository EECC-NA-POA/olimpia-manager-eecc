
import { processScoreByType } from './processors/scoreProcessor';
import { prepareFinalScoreData } from './processors/finalScoreProcessor';
import { AthleteData, PreparedScoreResult } from './types/scoreTypes';

export function prepareScoreData(
  formData: any,
  modalityRule: any,
  scoreType: 'tempo' | 'distancia' | 'pontos'
): PreparedScoreResult {
  console.log('Form data received:', formData);
  console.log('Modality rule:', modalityRule);
  console.log('Score type:', scoreType);
  
  const scoreData = processScoreByType(formData, modalityRule, scoreType);
  
  console.log('Prepared score data:', scoreData);
  
  return { scoreData };
}

// Re-export the prepareFinalScoreData function for backward compatibility
export { prepareFinalScoreData } from './processors/finalScoreProcessor';

// Re-export types for backward compatibility
export type { AthleteData } from './types/scoreTypes';
