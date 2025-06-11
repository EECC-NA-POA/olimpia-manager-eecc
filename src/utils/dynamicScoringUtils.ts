
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
  'pontuacao_configuracao',
  'bateria',
  'configuracao_de_pontuacao'
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
    console.log(`Campo ${campo.chave_campo} identificado como configuração por chave`);
    return true;
  }
  
  // Verificar por rótulo do campo (case insensitive)
  const rotuloNormalizado = campo.rotulo_campo.toLowerCase();
  if (rotuloNormalizado.includes('configuração') || 
      rotuloNormalizado.includes('config') ||
      rotuloNormalizado.includes('bateria') ||
      rotuloNormalizado.includes('configuracao')) {
    console.log(`Campo ${campo.chave_campo} identificado como configuração por rótulo`);
    return true;
  }
  
  // Verificar por tipo de input
  if (CONFIG_INPUT_TYPES.includes(campo.tipo_input)) {
    console.log(`Campo ${campo.chave_campo} identificado como configuração por tipo de input`);
    return true;
  }
  
  // Verificar por metadados que indicam configuração
  if (campo.metadados?.baterias === true && campo.tipo_input === 'checkbox') {
    console.log(`Campo ${campo.chave_campo} identificado como configuração por metadados`);
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
  console.log('Verificando se modelo usa baterias. Campos recebidos:', campos.length);
  
  const configFields = filterConfigurationFields(campos);
  console.log('Campos de configuração encontrados:', configFields.map(c => c.chave_campo));
  
  const usesBaterias = configFields.some(campo => {
    const hasKeyword = campo.chave_campo.toLowerCase().includes('bateria') || 
                      campo.rotulo_campo.toLowerCase().includes('bateria');
    const hasMetadata = campo.metadados?.baterias === true;
    const isCheckbox = campo.tipo_input === 'checkbox';
    
    console.log(`Campo ${campo.chave_campo}: hasKeyword=${hasKeyword}, hasMetadata=${hasMetadata}, isCheckbox=${isCheckbox}`);
    
    return (hasKeyword || hasMetadata) && isCheckbox;
  });
  
  console.log('Resultado final - modelo usa baterias:', usesBaterias);
  return usesBaterias;
}
