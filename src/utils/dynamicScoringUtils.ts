
import { CampoModelo } from '@/types/dynamicScoring';

/**
 * Determina se um modelo usa sistema de baterias baseado nos campos configurados
 * Verifica se existe algum campo relacionado a baterias ou se há configuração específica
 */
export function modelUsesBateriasByFields(campos: CampoModelo[]): boolean {
  if (!campos || campos.length === 0) {
    return false;
  }

  // Verifica se existe campo específico para bateria
  const hasBateriaField = campos.some(campo => 
    campo.chave_campo.toLowerCase().includes('bateria') ||
    campo.chave_campo.toLowerCase().includes('heat') ||
    campo.chave_campo.toLowerCase().includes('numero_bateria')
  );

  // Verifica se há metadados que indicam uso de baterias
  const hasMetadataWithBaterias = campos.some(campo => {
    const metadados = campo.metadados as any;
    return metadados && (
      metadados.uses_baterias === true ||
      metadados.bateria_system === true ||
      metadados.heat_system === true
    );
  });

  // Para modalidades como "Tiro com Arco", verificar se há configuração específica
  // que sugere uso de baterias (como campos de tentativas múltiplas)
  const hasMutipleAttempts = campos.some(campo =>
    campo.chave_campo.includes('tentativa_') && 
    campo.tipo_input !== 'configuration'
  );

  console.log('modelUsesBateriasByFields analysis:', {
    totalCampos: campos.length,
    hasBateriaField,
    hasMetadataWithBaterias,
    hasMutipleAttempts,
    campos: campos.map(c => ({ key: c.chave_campo, type: c.tipo_input }))
  });

  return hasBateriaField || hasMetadataWithBaterias || hasMutipleAttempts;
}

/**
 * Filtra campos para remover apenas campos de configuração
 * Mantém todos os campos de pontuação, incluindo os relacionados a baterias
 */
export function filterScoringFields(campos: CampoModelo[]): CampoModelo[] {
  return campos.filter(campo => {
    // Remove apenas campos marcados especificamente como configuração
    const isConfigField = campo.tipo_input === 'configuration' ||
                         campo.chave_campo === 'config_baterias' ||
                         campo.chave_campo === 'config_raias' ||
                         campo.chave_campo === 'regra_tipo';
    
    return !isConfigField;
  });
}

/**
 * Verifica se um campo específico é relacionado a baterias
 */
export function isFieldRelatedToBaterias(campo: CampoModelo): boolean {
  const chaveLower = campo.chave_campo.toLowerCase();
  return chaveLower.includes('bateria') || 
         chaveLower.includes('heat') || 
         chaveLower.includes('numero_bateria');
}

/**
 * Extrai configuração de baterias dos campos do modelo
 */
export function extractBateriaConfig(campos: CampoModelo[]): {
  usesBaterias: boolean;
  allowsFinal: boolean;
  maxBaterias?: number;
} {
  const bateriaFields = campos.filter(isFieldRelatedToBaterias);
  
  if (bateriaFields.length === 0) {
    // Se não há campos específicos mas há múltiplas tentativas, assumir que usa baterias
    const hasMutipleAttempts = campos.some(campo =>
      campo.chave_campo.includes('tentativa_') && 
      campo.tipo_input !== 'configuration'
    );
    
    return {
      usesBaterias: hasMutipleAttempts,
      allowsFinal: hasMutipleAttempts,
      maxBaterias: hasMutipleAttempts ? undefined : 0
    };
  }

  // Analisar metadados dos campos de bateria para configuração
  const bateriaConfig = bateriaFields.reduce((config, campo) => {
    const metadados = campo.metadados as any;
    if (metadados) {
      if (metadados.allows_final) config.allowsFinal = true;
      if (metadados.max_baterias) config.maxBaterias = metadados.max_baterias;
    }
    return config;
  }, { usesBaterias: true, allowsFinal: true });

  return bateriaConfig;
}
