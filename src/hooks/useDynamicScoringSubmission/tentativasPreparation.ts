
import { parseValueByFormat } from '@/components/judge/dynamic-scoring/utils/maskUtils';
import type { CampoModelo } from '@/types/dynamicScoring';

export function prepareTentativasData(
  formData: Record<string, any>,
  campos: CampoModelo[],
  pontuacaoId: number
) {
  return Object.entries(formData)
    .filter(([key, value]) => value !== '' && value !== null && value !== undefined)
    .map(([chave_campo, valor]) => {
      // Buscar campo do modelo para verificar formato
      const campo = campos.find(c => c.chave_campo === chave_campo);
      const formato = campo?.metadados?.formato_resultado;
      
      let valorNumerico = 0;
      let valorFormatado = '';
      
      if (formato && typeof valor === 'string') {
        const parsed = parseValueByFormat(valor, formato);
        valorNumerico = parsed.numericValue;
        valorFormatado = valor; // Manter o valor formatado original
      } else if (typeof valor === 'number') {
        valorNumerico = valor;
        valorFormatado = valor.toString();
      } else {
        valorNumerico = parseFloat(valor) || 0;
        valorFormatado = valor.toString();
      }
      
      return {
        pontuacao_id: pontuacaoId,
        chave_campo,
        valor: valorNumerico,
        valor_formatado: valorFormatado
      };
    });
}
