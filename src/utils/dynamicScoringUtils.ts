
import { CampoModelo } from '@/types/dynamicScoring';

/**
 * Campos que são configurações do modelo, não dados de pontuação por atleta
 */
export const CONFIG_FIELD_KEYS = [
  'usar_baterias',
  'configuracao_pontuacao',
  'pontuacao_configuracao',
  'configuracao_de_pontuacao',
  'config'
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
  // Não filtrar campos importantes como colocação e bateria
  const importantFields = ['colocacao', 'bateria', 'numero_bateria', 'placement', 'rank', 'raia'];
  const chaveNormalizada = campo.chave_campo.toLowerCase();
  const rotuloNormalizado = campo.rotulo_campo.toLowerCase();
  
  if (importantFields.some(field => chaveNormalizada.includes(field))) {
    console.log(`Campo ${campo.chave_campo} identificado como importante - não será filtrado`);
    return false;
  }
  
  // PRIMEIRA PRIORIDADE: Verificar explicitamente por "Usar Baterias" - este campo NUNCA deve aparecer na tabela
  if (rotuloNormalizado === 'usar baterias' || 
      chaveNormalizada === 'usar_baterias' ||
      rotuloNormalizado.includes('usar baterias') ||
      chaveNormalizada.includes('usar_baterias')) {
    console.log(`Campo ${campo.chave_campo} identificado como configuração "Usar Baterias" - será filtrado`);
    return true;
  }
  
  // SEGUNDA PRIORIDADE: Verificar por chave do campo (case insensitive) - mais restritivo
  if (CONFIG_FIELD_KEYS.some(key => chaveNormalizada === key || chaveNormalizada.includes(`_${key}`) || chaveNormalizada.includes(`${key}_`))) {
    console.log(`Campo ${campo.chave_campo} identificado como configuração por chave`);
    return true;
  }
  
  // TERCEIRA PRIORIDADE: Verificar por rótulo do campo - apenas configurações explícitas
  if (rotuloNormalizado === 'configuração' || 
      rotuloNormalizado === 'config' ||
      rotuloNormalizado === 'configuração de pontuação' ||
      rotuloNormalizado.startsWith('usar ') ||
      rotuloNormalizado.startsWith('configurar ')) {
    console.log(`Campo ${campo.chave_campo} identificado como configuração por rótulo`);
    return true;
  }
  
  // QUARTA PRIORIDADE: Verificar por tipo de input e metadados específicos para baterias
  if (campo.tipo_input === 'checkbox' && 
      (campo.metadados?.baterias === true || 
       chaveNormalizada.includes('usar_baterias') ||
       rotuloNormalizado.includes('usar baterias'))) {
    console.log(`Campo ${campo.chave_campo} identificado como configuração de bateria`);
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
  const filtered = campos.filter(campo => {
    const isConfig = isConfigurationField(campo);
    console.log(`Campo ${campo.chave_campo} (${campo.rotulo_campo}): isConfiguration=${isConfig}`);
    return !isConfig;
  });
  
  console.log('Filtragem de campos de pontuação:');
  console.log('- Campos originais:', campos.map(c => `${c.rotulo_campo} (${c.chave_campo})`));
  console.log('- Campos filtrados:', filtered.map(c => `${c.rotulo_campo} (${c.chave_campo})`));
  return filtered;
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

/**
 * Converte valor mascarado de tempo para milissegundos
 */
export function parseTimeToMilliseconds(timeValue: string): number {
  if (!timeValue || typeof timeValue !== 'string') return 0;
  
  // Formato esperado: MM:SS.mmm ou SS.mmm
  let totalMilliseconds = 0;
  
  try {
    if (timeValue.includes(':') && timeValue.includes('.')) {
      // Formato MM:SS.mmm
      const [minutesSeconds, milliseconds] = timeValue.split('.');
      const [minutes, seconds] = minutesSeconds.split(':');
      
      totalMilliseconds += (parseInt(minutes) || 0) * 60 * 1000;
      totalMilliseconds += (parseInt(seconds) || 0) * 1000;
      totalMilliseconds += parseInt(milliseconds) || 0;
    } else if (timeValue.includes(':')) {
      // Formato MM:SS
      const [minutes, seconds] = timeValue.split(':');
      totalMilliseconds += (parseInt(minutes) || 0) * 60 * 1000;
      totalMilliseconds += (parseInt(seconds) || 0) * 1000;
    } else if (timeValue.includes('.')) {
      // Formato SS.mmm
      const [seconds, milliseconds] = timeValue.split('.');
      totalMilliseconds += (parseInt(seconds) || 0) * 1000;
      totalMilliseconds += parseInt(milliseconds) || 0;
    } else {
      // Apenas número
      totalMilliseconds = parseFloat(timeValue) * 1000 || 0;
    }
  } catch (error) {
    console.error('Erro ao converter tempo para milissegundos:', error);
    return 0;
  }
  
  return totalMilliseconds;
}

/**
 * Detecta se um valor é um tempo formatado
 */
export function isTimeValue(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  
  // Padrões de tempo: MM:SS.mmm, MM:SS, SS.mmm
  const timePatterns = [
    /^\d{1,2}:\d{2}\.\d{1,3}$/, // MM:SS.mmm
    /^\d{1,2}:\d{2}$/, // MM:SS
    /^\d{1,2}\.\d{1,3}$/ // SS.mmm
  ];
  
  return timePatterns.some(pattern => pattern.test(value.trim()));
}
