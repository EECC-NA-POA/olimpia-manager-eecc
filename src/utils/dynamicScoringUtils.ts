import { CampoModelo } from '@/types/dynamicScoring';

/**
 * Filters out configuration fields that should not appear in scoring tables
 * Configuration fields are used for setup but not for actual scoring
 */
export function filterScoringFields(campos: CampoModelo[]): CampoModelo[] {
  const configurationFieldTypes = ['checkbox', 'config'];
  const configurationFieldKeys = ['baterias', 'pontuacao', 'configuracao_pontuacao', 'usar_baterias'];
  
  return campos.filter(campo => {
    // Filter out by input type (checkbox and config are typically configuration)
    if (configurationFieldTypes.includes(campo.tipo_input)) {
      return false;
    }
    
    // Filter out by field key (known configuration field keys)
    if (configurationFieldKeys.includes(campo.chave_campo.toLowerCase())) {
      return false;
    }
    
    // Keep all other fields as scoring fields
    return true;
  });
}

/**
 * Checks if a modality uses baterias based on its campos configuration
 */
export function modelUsesBateriasByFields(campos: CampoModelo[]): boolean {
  return campos.some(campo => 
    campo.chave_campo.toLowerCase() === 'baterias' && 
    campo.tipo_input === 'checkbox'
  );
}

/**
 * Extracts bateria configuration from campos
 */
export function extractBateriaConfig(campos: CampoModelo[]): {
  usesBaterias: boolean;
  allowsFinal: boolean;
} {
  const bateriaField = campos.find(campo => 
    campo.chave_campo.toLowerCase() === 'baterias'
  );
  
  const usesBaterias = !!bateriaField;
  const allowsFinal = bateriaField?.metadados?.permite_final === true;
  
  return {
    usesBaterias,
    allowsFinal
  };
}
