
import { parseValueByFormat } from '@/components/judge/dynamic-scoring/utils/maskUtils';
import type { CampoModelo } from '@/types/dynamicScoring';

export function calculateMainScore(
  formData: Record<string, any>, 
  campos: CampoModelo[]
): number {
  console.log('Form entries for calculation:', Object.entries(formData));
  
  // Priorizar campos com nomes específicos para o valor principal
  const formEntries = Object.entries(formData);
  const resultField = formEntries.find(([key]) => 
    ['resultado', 'tempo', 'distancia', 'pontos', 'score'].includes(key.toLowerCase())
  );
  
  if (resultField) {
    const [fieldKey, fieldValue] = resultField;
    console.log('Found result field:', fieldKey, 'with value:', fieldValue);
    
    // Buscar o campo no modelo para verificar formato
    const campo = campos.find(c => c.chave_campo === fieldKey);
    const formato = campo?.metadados?.formato_resultado;
    
    if (formato && typeof fieldValue === 'string') {
      const parsed = parseValueByFormat(fieldValue, formato);
      console.log('Parsed value:', { original: fieldValue, numeric: parsed.numericValue, format: formato });
      return parsed.numericValue;
    } else if (typeof fieldValue === 'number') {
      return fieldValue;
    } else if (typeof fieldValue === 'string' && fieldValue) {
      // Tentar converter string para número
      const numericValue = parseFloat(fieldValue.replace(/[^\d.,]/g, '').replace(',', '.'));
      return isNaN(numericValue) ? 0 : numericValue;
    }
  }
  
  // Se não encontrar campo específico, usar o primeiro campo numérico
  const numericField = formEntries.find(([key, value]) => 
    typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)))
  );
  
  if (numericField) {
    const [, value] = numericField;
    return typeof value === 'number' ? value : parseFloat(value) || 0;
  }
  
  return 0;
}
