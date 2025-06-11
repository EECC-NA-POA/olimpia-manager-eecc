
import { CampoModelo } from '@/types/dynamicScoring';

/**
 * Campos que são configurações do modelo, não dados de pontuação por atleta
 */
export const CONFIG_FIELD_KEYS = [
  'baterias',
  'configuracao',
  'config',
  'usar_baterias',
  'configuracao_pontuacao'
];

/**
 * Tipos de input que geralmente são configurações
 */
export const CONFIG_INPUT_TYPES = [
  'checkbox'
];

/**
 * Verifica se um campo é de configuração do modelo
 */
export function isConfigurationField(campo: CampoModelo): boolean {
  // Verificar por chave do campo
  if (CONFIG_FIELD_KEYS.includes(campo.chave_campo.toLowerCase())) {
    return true;
  }
  
  // Verificar por tipo de input
  if (CONFIG_INPUT_TYPES.includes(campo.tipo_input)) {
    return true;
  }
  
  // Verificar por metadados que indicam configuração
  if (campo.metadados?.baterias === true && campo.tipo_input === 'checkbox') {
    return true;
  }
  
  return false;
}

/**
 * Filtra campos removendo configurações, mantendo apenas campos de pontuação
 */
export function filterScoringFields(campos: CampoModelo[]): CampoModelo[] {
  return campos.filter(campo => !isConfigurationField(campo));
}

/**
 * Filtra campos mantendo apenas configurações
 */
export function filterConfigurationFields(campos: CampoModelo[]): CampoModelo[] {
  return campos.filter(campo => isConfigurationField(campo));
}

/**
 * Verifica se o modelo usa baterias baseado nos campos de configuração
 */
export function modelUsesBaterias(campos: CampoModelo[]): boolean {
  const configFields = filterConfigurationFields(campos);
  return configFields.some(campo => 
    campo.chave_campo.toLowerCase().includes('bateria') && 
    campo.metadados?.baterias === true
  );
}
