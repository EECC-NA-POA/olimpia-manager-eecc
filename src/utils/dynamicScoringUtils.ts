
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

/**
 * Checks if a value represents a time format (MM:SS.mmm or similar)
 */
export function isTimeValue(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  
  // Check for time patterns like MM:SS, MM:SS.mmm, M:SS, etc.
  const timePattern = /^\d{1,2}:\d{2}(?:\.\d{1,3})?$/;
  return timePattern.test(value.trim());
}

/**
 * Parses a time value (MM:SS.mmm) to milliseconds
 */
export function parseTimeToMilliseconds(timeValue: string): number {
  if (!isTimeValue(timeValue)) {
    return 0;
  }
  
  const cleanValue = timeValue.trim();
  let totalMilliseconds = 0;
  
  if (cleanValue.includes(':') && cleanValue.includes('.')) {
    // Format: MM:SS.mmm
    const [minutesSeconds, milliseconds] = cleanValue.split('.');
    const [minutes, seconds] = minutesSeconds.split(':');
    
    totalMilliseconds += (parseInt(minutes) || 0) * 60 * 1000; // minutes to ms
    totalMilliseconds += (parseInt(seconds) || 0) * 1000; // seconds to ms
    totalMilliseconds += parseInt(milliseconds) || 0; // milliseconds
  } else if (cleanValue.includes(':')) {
    // Format: MM:SS
    const [minutes, seconds] = cleanValue.split(':');
    totalMilliseconds += (parseInt(minutes) || 0) * 60 * 1000;
    totalMilliseconds += (parseInt(seconds) || 0) * 1000;
  } else {
    // Fallback: treat as pure number
    totalMilliseconds = parseInt(cleanValue) || 0;
  }
  
  return totalMilliseconds;
}
