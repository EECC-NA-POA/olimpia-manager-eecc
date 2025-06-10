import { ModalityRule } from '../../tabs/scores/hooks/useModeloConfiguration';

export const prepareSubmissionData = (data: any, rule: ModalityRule | null) => {
  // Convert meters and centimeters to decimal value for distance scoring
  if (rule?.regra_tipo === 'distancia' && rule.parametros.subunidade === 'cm' && 'meters' in data && 'centimeters' in data) {
    return {
      ...data,
      score: data.meters + (data.centimeters / 100), // Convert to decimal meters
      meters: undefined,
      centimeters: undefined
    };
  }
  
  return data;
};
