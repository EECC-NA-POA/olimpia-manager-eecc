
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
        const parsed = parseValueByFormat(value.toString(), campo.metadados.formato_resultado);
        processedValue = parsed.numericValue;
        valorFormatado = value; // Manter o valor formatado como foi inserido
        
        console.log(`Campo ${campo.chave_campo} com formato ${campo.metadados.formato_resultado}:`, {
          originalValue: value,
          processedValue,
          valorFormatado
        });
      } else if (campo.tipo_input === 'number' || campo.tipo_input === 'integer') {
        processedValue = Number(value);
        valorFormatado = value.toString();
      } else {
        valorFormatado = value.toString();
      }

      const tentativa = {
        pontuacao_id: pontuacaoId,
        chave_campo: campo.chave_campo,
        valor: processedValue,
        valor_formatado: valorFormatado,
        ordem_tentativa: 1
      };

      console.log(`Tentativa criada para ${campo.chave_campo}:`, tentativa);
      tentativas.push(tentativa);
    }
  });

  console.log('=== TENTATIVAS FINAIS ===');
  console.log('Total tentativas:', tentativas.length);
  console.log('Tentativas:', tentativas);

  return tentativas;
}
