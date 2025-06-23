
import { CampoModelo } from '@/types/dynamicScoring';
import { parseValueByFormat } from '@/components/judge/dynamic-scoring/utils/maskUtils';

export function prepareTentativasData(
  formData: Record<string, any>,
  campos: CampoModelo[],
  pontuacaoId: number
) {
  console.log('=== PREPARANDO TENTATIVAS ===');
  console.log('Form data:', formData);
  console.log('Campos:', campos);

  const tentativas: any[] = [];

  campos.forEach(campo => {
    const value = formData[campo.chave_campo];
    console.log(`Processing campo ${campo.chave_campo} with value:`, value);
    
    if (value !== undefined && value !== null && value !== '') {
      let processedValue = value;
      let valorFormatado = value;

      // Se o campo tem formato específico, processar adequadamente
      if (campo.metadados?.formato_resultado) {
        try {
          const parsed = parseValueByFormat(value.toString(), campo.metadados.formato_resultado);
          processedValue = parsed.numericValue;
          valorFormatado = value; // Manter o valor formatado como foi inserido
          
          console.log(`Campo ${campo.chave_campo} com formato ${campo.metadados.formato_resultado}:`, {
            originalValue: value,
            processedValue,
            valorFormatado
          });
        } catch (error) {
          console.error(`Error parsing value for campo ${campo.chave_campo}:`, error);
          // Se houver erro no parsing, usar o valor original
          processedValue = value;
          valorFormatado = value.toString();
        }
      } else if (campo.tipo_input === 'number' || campo.tipo_input === 'integer') {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          processedValue = numValue;
          valorFormatado = value.toString();
        } else {
          console.warn(`Invalid number value for campo ${campo.chave_campo}:`, value);
          processedValue = 0;
          valorFormatado = '0';
        }
      } else {
        valorFormatado = value.toString();
      }

      const tentativa = {
        pontuacao_id: pontuacaoId,
        chave_campo: campo.chave_campo,
        valor: processedValue,
        valor_formatado: valorFormatado
        // Removido ordem_tentativa pois não existe na tabela
      };

      console.log(`Tentativa criada para ${campo.chave_campo}:`, tentativa);
      tentativas.push(tentativa);
    } else {
      console.log(`Skipping campo ${campo.chave_campo} - empty value`);
    }
  });

  console.log('=== TENTATIVAS FINAIS ===');
  console.log('Total tentativas:', tentativas.length);
  console.log('Tentativas:', tentativas);

  return tentativas;
}
