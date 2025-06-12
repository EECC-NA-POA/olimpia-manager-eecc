
import { isTimeValue } from '@/utils/dynamicScoringUtils';

export function detectReferenceField(
  athleteScores: Record<string, any>,
  configuredField?: string
): string | null {
  console.log('Campo de referência configurado:', configuredField);
  
  // Se não há campo de referência configurado ou o campo configurado não existe nos dados,
  // tentar encontrar um campo válido
  const firstAthleteData = Object.values(athleteScores)[0] || {};
  const availableFields = Object.keys(firstAthleteData).filter(key => 
    key !== 'athleteName' && 
    key !== 'athleteId' && 
    firstAthleteData[key] !== '' && 
    firstAthleteData[key] !== null && 
    firstAthleteData[key] !== undefined
  );
  
  console.log('Campos disponíveis nos dados:', availableFields);
  
  // Verificar se o campo de referência configurado realmente existe nos dados
  if (configuredField && !availableFields.includes(configuredField)) {
    console.warn(`Campo de referência configurado "${configuredField}" não encontrado nos dados. Tentando detectar automaticamente.`);
    configuredField = undefined; // Forçar detecção automática
  }
  
  // Detectar automaticamente se necessário
  if (!configuredField) {
    console.log('Realizando detecção automática do campo de referência...');
    
    // Filtrar campos válidos que contêm valores numéricos ou de tempo
    const validFields = availableFields.filter(key => {
      const value = firstAthleteData[key];
      console.log(`Verificando campo ${key} com valor:`, value, 'tipo:', typeof value);
      
      // Verificar se é um valor numérico ou de tempo
      if (typeof value === 'string' && isTimeValue(value)) return true;
      if (!isNaN(parseFloat(String(value))) && parseFloat(String(value)) > 0) return true;
      
      return false;
    });
    
    console.log('Campos válidos disponíveis para cálculo:', validFields);
    
    if (validFields.length > 0) {
      // Lista ordenada de campos prioritários para pontuações
      const priorityFields = ['resultado', 'tempo', 'time', 'distancia', 'distance', 'pontos', 'score', 'points'];
      
      // Tentar encontrar um campo prioritário primeiro
      for (const priority of priorityFields) {
        const match = validFields.find(field => 
          field.toLowerCase() === priority || 
          field.toLowerCase().includes(priority)
        );
        
        if (match) {
          configuredField = match;
          console.log(`Campo prioritário encontrado: ${configuredField}`);
          break;
        }
      }
      
      // Se não encontrou campo prioritário, usar o primeiro campo válido
      if (!configuredField) {
        configuredField = validFields[0];
        console.log(`Nenhum campo prioritário encontrado. Usando primeiro campo válido: ${configuredField}`);
      }
    }
  }
  
  return configuredField || null;
}
