
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { parseValueByFormat } from '@/components/judge/dynamic-scoring/utils/maskUtils';

interface DynamicSubmissionData {
  eventId: string;
  modalityId: number;
  athleteId: string;
  equipeId?: number;
  judgeId: string;
  modeloId: number;
  bateriaId?: number;
  raia?: number;
  formData: Record<string, any>;
  notes?: string;
}

export function useDynamicScoringSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DynamicSubmissionData) => {
      console.log('=== INICIANDO SUBMISSÃO DE PONTUAÇÃO DINÂMICA ===');
      console.log('Dynamic scoring submission data:', data);

      try {
        // Buscar campos do modelo para determinar o campo principal
        const { data: campos, error: camposError } = await supabase
          .from('campos_modelo')
          .select('*')
          .eq('modelo_id', data.modeloId)
          .order('ordem_exibicao');

        if (camposError) {
          console.error('Error fetching campos:', camposError);
          throw camposError;
        }

        // Calcular valor_pontuacao principal a partir dos dados do formulário
        let valorPontuacao = 0;
        let valorOriginal = '';
        
        // Procurar por campos que possam representar o resultado principal
        const formEntries = Object.entries(data.formData);
        console.log('Form entries for calculation:', formEntries);
        
        // Priorizar campos com nomes específicos para o valor principal
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
            valorPontuacao = parsed.numericValue;
            valorOriginal = parsed.originalValue;
            console.log('Parsed value:', { original: valorOriginal, numeric: valorPontuacao, format: formato });
          } else if (typeof fieldValue === 'number') {
            valorPontuacao = fieldValue;
            valorOriginal = fieldValue.toString();
          } else if (typeof fieldValue === 'string' && fieldValue) {
            // Tentar converter string para número
            const numericValue = parseFloat(fieldValue.replace(/[^\d.,]/g, '').replace(',', '.'));
            valorPontuacao = isNaN(numericValue) ? 0 : numericValue;
            valorOriginal = fieldValue;
          }
        } else {
          // Se não encontrar campo específico, usar o primeiro campo numérico
          const numericField = formEntries.find(([key, value]) => 
            typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)))
          );
          
          if (numericField) {
            const [, value] = numericField;
            valorPontuacao = typeof value === 'number' ? value : parseFloat(value) || 0;
            valorOriginal = value.toString();
          }
        }
        
        console.log('Calculated valor_pontuacao:', valorPontuacao);
        console.log('Original value:', valorOriginal);

        // 1. Verificar se já existe pontuação para este atleta
        const { data: existingScore } = await supabase
          .from('pontuacoes')
          .select('id')
          .eq('evento_id', data.eventId)
          .eq('modalidade_id', data.modalityId)
          .eq('atleta_id', data.athleteId)
          .eq('modelo_id', data.modeloId)
          .eq('juiz_id', data.judgeId)
          .maybeSingle();

        let pontuacao;

        if (existingScore) {
          // Atualizar pontuação existente
          console.log('=== ATUALIZANDO PONTUAÇÃO EXISTENTE ===');
          const { data: updatedScore, error: updateError } = await supabase
            .from('pontuacoes')
            .update({
              valor_pontuacao: valorPontuacao,
              observacoes: data.notes || null,
              data_registro: new Date().toISOString(),
              raia: data.raia || null,
              numero_bateria: data.bateriaId || null
            })
            .eq('id', existingScore.id)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating pontuacao:', updateError);
            throw updateError;
          }

          pontuacao = updatedScore;
          
          // Remover tentativas antigas
          await supabase
            .from('tentativas_pontuacao')
            .delete()
            .eq('pontuacao_id', existingScore.id);

        } else {
          // Criar nova pontuação
          console.log('=== CRIANDO NOVA PONTUAÇÃO ===');
          const pontuacaoData = {
            evento_id: data.eventId,
            modalidade_id: data.modalityId,
            atleta_id: data.athleteId,
            equipe_id: data.equipeId || null,
            juiz_id: data.judgeId,
            modelo_id: data.modeloId,
            valor_pontuacao: valorPontuacao,
            observacoes: data.notes || null,
            data_registro: new Date().toISOString(),
            unidade: 'dinâmica',
            raia: data.raia || null,
            numero_bateria: data.bateriaId || null
          };

          const { data: newScore, error: pontuacaoError } = await supabase
            .from('pontuacoes')
            .insert([pontuacaoData])
            .select()
            .single();

          if (pontuacaoError) {
            console.error('Error creating pontuacao:', pontuacaoError);
            throw pontuacaoError;
          }

          pontuacao = newScore;
        }

        console.log('=== PONTUAÇÃO SALVA COM SUCESSO ===');
        console.log('Pontuação:', pontuacao);

        // 2. Criar registros na tabela tentativas_pontuacao para cada campo
        const tentativas = Object.entries(data.formData)
          .filter(([key, value]) => value !== '' && value !== null && value !== undefined)
          .map(([chave_campo, valor]) => {
            // Buscar campo do modelo para verificar formato
            const campo = campos.find(c => c.chave_campo === chave_campo);
            const formato = campo?.metadados?.formato_resultado;
            
            let valorNumerico = 0;
            let valorFormatado = valor.toString();
            
            if (formato && typeof valor === 'string') {
              const parsed = parseValueByFormat(valor, formato);
              valorNumerico = parsed.numericValue;
              valorFormatado = parsed.originalValue;
            } else if (typeof valor === 'number') {
              valorNumerico = valor;
              valorFormatado = valor.toString();
            } else {
              valorNumerico = parseFloat(valor) || 0;
              valorFormatado = valor.toString();
            }
            
            return {
              pontuacao_id: pontuacao.id,
              chave_campo,
              valor: valorNumerico,
              valor_formatado: valorFormatado
            };
          });

        console.log('=== INSERINDO TENTATIVAS ===');
        console.log('Tentativas a serem inseridas:', tentativas);

        if (tentativas.length > 0) {
          const { error: tentativasError } = await supabase
            .from('tentativas_pontuacao')
            .insert(tentativas);

          if (tentativasError) {
            console.error('Error creating tentativas:', tentativasError);
            throw tentativasError;
          }

          console.log('=== TENTATIVAS CRIADAS COM SUCESSO ===');
        }

        console.log('=== SUBMISSÃO CONCLUÍDA COM SUCESSO ===');
        return pontuacao;

      } catch (error) {
        console.error('=== ERRO GERAL NA SUBMISSÃO ===');
        console.error('Error in mutation:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log('=== SUCESSO NA MUTAÇÃO ===');
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['athlete-scores', variables.athleteId, variables.modalityId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['modality-scores', variables.modalityId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['athlete-dynamic-scores', variables.modalityId, variables.eventId] 
      });
      
      toast.success('Pontuação registrada com sucesso!');
    },
    onError: (error) => {
      console.error('=== ERRO NA MUTAÇÃO ===');
      console.error('Error submitting dynamic score:', error);
      toast.error('Erro ao registrar pontuação');
    }
  });
}
