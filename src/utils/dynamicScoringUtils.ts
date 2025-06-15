
import { CampoModelo } from '@/types/dynamicScoring';

export function filterScoringFields(campos: CampoModelo[]): CampoModelo[] {
  const configurationFieldKeys = [
    'usar_baterias',
    'configuracao_pontuacao',
    'config_baterias',
    'bateria_config',
    'sistema_baterias',
    'usar_bateria',
    'configuracao_de_pontuacao',
    'config_pontuacao'
  ];
  
  return campos.filter(campo => {
    // Filter out configuration fields by exact key match (case insensitive)
    const lowerKey = campo.chave_campo.toLowerCase();
    if (configurationFieldKeys.includes(lowerKey)) {
      console.log('Filtering out configuration field:', campo.chave_campo);
      return false;
    }
    
    // Filter out any field that contains "bateria" AND "config" in the key (case insensitive)
    if (lowerKey.includes('bateria') && lowerKey.includes('config')) {
      console.log('Filtering out bateria config field:', campo.chave_campo);
      return false;
    }
    
    // Filter out any field that contains "usar_bateria" in the key (case insensitive)
    if (lowerKey.includes('usar_bateria')) {
      console.log('Filtering out usar_bateria field:', campo.chave_campo);
      return false;
    }
    
    // Filter out any field that contains "configuracao" AND "pontuacao" in the key (case insensitive)
    if (lowerKey.includes('configuracao') && lowerKey.includes('pontuacao')) {
      console.log('Filtering out configuracao pontuacao field:', campo.chave_campo);
      return false;
    }
    
    // Additional specific patterns for configuration fields
    if (lowerKey.includes('config') && (lowerKey.includes('pont') || lowerKey.includes('score'))) {
      console.log('Filtering out config scoring field:', campo.chave_campo);
      return false;
    }
    
    return true;
  });
}

export function filterCalculatedFields(campos: CampoModelo[]): CampoModelo[] {
  return campos.filter(campo => campo.tipo_input === 'calculated');
}

export function filterManualFields(campos: CampoModelo[]): CampoModelo[] {
  return campos.filter(campo => 
    campo.tipo_input !== 'calculated' && 
    !['bateria', 'numero_bateria', 'config'].includes(campo.chave_campo?.toLowerCase() || '')
  );
}

// Esta função agora aceita a configuração do modelo em vez de apenas campos
export function modelUsesBaterias(modeloConfig?: { parametros?: { baterias?: boolean } }): boolean {
  console.log('Verificando se modelo usa baterias. Config recebida:', modeloConfig);
  
  if (!modeloConfig?.parametros) {
    console.log('Sem configuração de parâmetros, retornando false');
    return false;
  }
  
  const usesBaterias = modeloConfig.parametros.baterias === true;
  console.log('Resultado final - modelo usa baterias:', usesBaterias);
  
  return usesBaterias;
}

// Função legacy para compatibilidade (deprecated)
export function modelUsesBateriasByFields(campos: CampoModelo[]): boolean {
  console.log('Verificando se modelo usa baterias. Campos recebidos:', campos.length);
  
  // Procurar por campos relacionados a baterias ou configuração
  const configFields = campos.filter(campo => 
    ['bateria', 'numero_bateria'].includes(campo.chave_campo?.toLowerCase() || '')
  );
  
  console.log('Campos de configuração encontrados:', configFields.map(c => c.chave_campo));
  
  const usesBaterias = configFields.some(campo => 
    ['bateria', 'numero_bateria'].includes(campo.chave_campo?.toLowerCase() || '') ||
    campo.metadados?.baterias === true
  );
  
  console.log('Resultado final - modelo usa baterias:', usesBaterias);
  return usesBaterias;
}

// Funções utilitárias para tempo
export function isTimeValue(value: string): boolean {
  // Verifica se é um valor de tempo no formato MM:SS ou HH:MM:SS
  const timePattern = /^\d{1,2}:\d{2}(:\d{2})?$/;
  return timePattern.test(value);
}

export function parseTimeToMilliseconds(timeString: string): number {
  const parts = timeString.split(':').map(Number);
  
  if (parts.length === 2) {
    // MM:SS format
    return (parts[0] * 60 + parts[1]) * 1000;
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
  }
  
  return 0;
}
