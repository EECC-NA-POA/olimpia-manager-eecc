
import { CampoConfig } from '../types';

export const createDefaultField = (regraType: string): CampoConfig => {
  const baseField = {
    id: 'campo_' + Date.now(),
    chave_campo: regraType,
    rotulo_campo: getDefaultLabel(regraType),
    tipo_input: 'number',
    obrigatorio: true,
    ordem_exibicao: 1,
    metadados: {}
  };

  switch (regraType) {
    case 'tempo':
      return {
        ...baseField,
        metadados: {
          formato_resultado: 'tempo',
          placeholder: 'MM:SS.mmm'
        }
      };
    case 'distancia':
      return {
        ...baseField,
        metadados: {
          formato_resultado: 'distancia',
          placeholder: '##,## m'
        }
      };
    case 'pontos':
      return {
        ...baseField,
        metadados: {
          formato_resultado: 'pontos',
          placeholder: '###.##'
        }
      };
    default:
      return baseField;
  }
};

export const getDefaultLabel = (regraType: string): string => {
  switch (regraType) {
    case 'tempo': return 'Tempo';
    case 'distancia': return 'Distância';
    case 'pontos': return 'Pontos';
    default: return 'Resultado';
  }
};

export const createBateriaField = (): CampoConfig => {
  return {
    id: 'campo_bateria_' + Date.now(),
    chave_campo: 'bateria',
    rotulo_campo: 'Bateria',
    tipo_input: 'integer',
    obrigatorio: true,
    ordem_exibicao: 1, // Always first
    metadados: {
      min: 1,
      max: 999,
      readonly: true // Campo será preenchido automaticamente
    }
  };
};
