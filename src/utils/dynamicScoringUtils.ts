
import { CampoModelo } from '@/types/dynamicScoring';

export function filterScoringFields(campos: CampoModelo[]): CampoModelo[] {
  return campos.filter(campo => 
    !['configuracao', 'config'].includes(campo.categoria?.toLowerCase() || '')
  );
}

export function filterCalculatedFields(campos: CampoModelo[]): CampoModelo[] {
  return campos.filter(campo => campo.tipo_input === 'calculated');
}

export function filterManualFields(campos: CampoModelo[]): CampoModelo[] {
  return campos.filter(campo => 
    campo.tipo_input !== 'calculated' && 
    !['configuracao', 'config'].includes(campo.categoria?.toLowerCase() || '')
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
    ['configuracao', 'config'].includes(campo.categoria?.toLowerCase() || '') ||
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
