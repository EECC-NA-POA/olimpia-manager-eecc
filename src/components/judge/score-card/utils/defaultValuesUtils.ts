
import { ModalityRule } from '../../tabs/scores/hooks/useModalityRules';

export const getDefaultValues = (initialValues: any, rule: ModalityRule | null) => {
  if (initialValues) return initialValues;
  if (!rule) return { score: 0, notes: '' };
  
  switch (rule.regra_tipo) {
    case 'tempo':
      return { minutes: 0, seconds: 0, milliseconds: 0, notes: '' };
    case 'distancia':
      if (rule.parametros.subunidade === 'cm') {
        return { meters: 0, centimeters: 0, notes: '' };
      }
      return { score: 0, notes: '' };
    case 'baterias':
      const numTentativas = rule.parametros.num_tentativas || 3;
      return {
        tentativas: Array.from({ length: numTentativas }, () => ({ valor: 0, raia: '' })),
        notes: ''
      };
    case 'sets':
      const melhorDe = rule.parametros.melhor_de || rule.parametros.num_sets || 3;
      const pontuaPorSet = rule.parametros.pontua_por_set !== false;
      const isVolleyball = rule.parametros.pontos_por_set !== undefined;
      
      if (pontuaPorSet) {
        return {
          sets: Array.from({ length: melhorDe }, () => ({ pontos: 0 })),
          notes: ''
        };
      } else if (isVolleyball) {
        return {
          sets: Array.from({ length: melhorDe }, () => ({ 
            vencedor: undefined, 
            pontosEquipe1: 0, 
            pontosEquipe2: 0 
          })),
          notes: ''
        };
      } else {
        return {
          sets: Array.from({ length: melhorDe }, () => ({ vencedor: undefined })),
          notes: ''
        };
      }
    case 'arrows':
      const numFlechas = rule.parametros.num_flechas || 6;
      return {
        flechas: Array.from({ length: numFlechas }, () => ({ zona: '0' })),
        notes: ''
      };
    default:
      return { score: 0, notes: '' };
  }
};
