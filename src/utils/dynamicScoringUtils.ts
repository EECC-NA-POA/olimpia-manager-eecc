
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
    'config_pontuacao',
    'configuracao_pontos',
    'config_pontos',
    'sistema_pontuacao',
    'config_sistema',
    'bateria_sistema',
    'pontuacao_config'
  ];
  
  return campos.filter(campo => {
    const lowerKey = campo.chave_campo.toLowerCase();
    const lowerLabel = campo.rotulo_campo.toLowerCase();
    
    // Filter out configuration fields by exact key match (case insensitive)
    if (configurationFieldKeys.includes(lowerKey)) {
      console.log('Filtering out configuration field by key:', campo.chave_campo);
      return false;
    }
    
    // Filter out by label content (case insensitive)
    if (lowerLabel.includes('usar bateria') || lowerLabel.includes('usar baterias')) {
      console.log('Filtering out "Usar Baterias" field by label:', campo.rotulo_campo);
      return false;
    }
    
    if (lowerLabel.includes('configuração') && lowerLabel.includes('pontuação')) {
      console.log('Filtering out "Configuração de Pontuação" field by label:', campo.rotulo_campo);
      return false;
    }
    
    if (lowerLabel.includes('configuração') && lowerLabel.includes('pontos')) {
      console.log('Filtering out configuration field by label:', campo.rotulo_campo);
      return false;
    }
    
    // Filter out any field that contains "bateria" AND "config" in the key (case insensitive)
    if (lowerKey.includes('bateria') && lowerKey.includes('config')) {
      console.log('Filtering out bateria config field:', campo.chave_campo);
      return false;
    }
    
    // Filter out any field that contains "usar" AND "bateria" in the key (case insensitive)
    if (lowerKey.includes('usar') && lowerKey.includes('bateria')) {
      console.log('Filtering out usar_bateria field:', campo.chave_campo);
      return false;
    }
    
    // Filter out any field that contains "configuracao" AND "pontuacao" in the key (case insensitive)
    if (lowerKey.includes('configuracao') && lowerKey.includes('pontuacao')) {
      console.log('Filtering out configuracao pontuacao field:', campo.chave_campo);
      return false;
    }
    
    // Filter out any field that contains "config" AND ("pont" OR "score") in the key (case insensitive)
    if (lowerKey.includes('config') && (lowerKey.includes('pont') || lowerKey.includes('score'))) {
      console.log('Filtering out config scoring field:', campo.chave_campo);
      return false;
    }
    
    // Filter out any field that contains "sistema" AND ("bateria" OR "pontuacao") in the key (case insensitive)
    if (lowerKey.includes('sistema') && (lowerKey.includes('bateria') || lowerKey.includes('pontuacao'))) {
      console.log('Filtering out sistema field:', campo.chave_campo);
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
