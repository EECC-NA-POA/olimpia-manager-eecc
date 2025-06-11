
import { CampoModelo } from '@/types/dynamicScoring';

/**
 * Campos que são configurações do modelo, não dados de pontuação por atleta
 */
export const CONFIG_FIELD_KEYS = [
  'baterias',
  'configuracao',
  'config',
  'usar_baterias',
  'configuracao_pontuacao',
  'pontuacao_configuracao'
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
  // Verificar por chave do campo (case insensitive)
  const chaveNormalizada = campo.chave_campo.toLowerCase();
  if (CONFIG_FIELD_KEYS.some(key => chaveNormalizada.includes(key))) {
    return true;
  }
  
  // Verificar por rótulo do campo (case insensitive)
  const rotuloNormalizado = campo.rotulo_campo.toLowerCase();
  if (rotuloNormalizado.includes('configuração') || 
      rotuloNormalizado.includes('config') ||
      rotuloNormalizado.includes('bateria')) {
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
 * Verifica se um campo é calculado (colocação, ranking, etc.)
 */
export function isCalculatedField(campo: CampoModelo): boolean {
  return campo.tipo_input === 'calculated';
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
 * Filtra campos calculados
 */
export function filterCalculatedFields(campos: CampoModelo[]): CampoModelo[] {
  return campos.filter(campo => isCalculatedField(campo));
}

/**
 * Filtra campos manuais (não calculados nem de configuração)
 */
export function filterManualFields(campos: CampoModelo[]): CampoModelo[] {
  return campos.filter(campo => !isConfigurationField(campo) && !isCalculatedField(campo));
}

/**
 * Verifica se o modelo usa baterias baseado nos campos de configuração
 */
export function modelUsesBaterias(campos: CampoModelo[]): boolean {
  const configFields = filterConfigurationFields(campos);
  return configFields.some(campo => 
    (campo.chave_campo.toLowerCase().includes('bateria') || 
     campo.rotulo_campo.toLowerCase().includes('bateria')) && 
    (campo.metadados?.baterias === true || campo.tipo_input === 'checkbox')
  );
}
