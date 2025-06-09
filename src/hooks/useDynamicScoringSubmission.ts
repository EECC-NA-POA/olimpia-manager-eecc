
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
        // 1. Criar registro na tabela pontuacoes (sem bateria_id)
        const pontuacaoData = {
          evento_id: data.eventId,
          modalidade_id: data.modalityId,
          atleta_id: data.athleteId,
          equipe_id: data.equipeId || null,
          juiz_id: data.judgeId,
          modelo_id: data.modeloId,
          observacoes: data.notes || null,
          data_registro: new Date().toISOString(),
          unidade: 'dinâmica' // Para identificar pontuações dinâmicas
        };

        console.log('=== INSERINDO PONTUAÇÃO ===');
        console.log('Dados da pontuação:', pontuacaoData);

        const { data: pontuacao, error: pontuacaoError } = await supabase
          .from('pontuacoes')
          .insert([pontuacaoData])
          .select()
          .single();

        if (pontuacaoError) {
          console.error('=== ERRO AO CRIAR PONTUAÇÃO ===');
          console.error('Error creating pontuacao:', pontuacaoError);
          throw pontuacaoError;
        }

        console.log('=== PONTUAÇÃO CRIADA COM SUCESSO ===');
        console.log('Created pontuacao:', pontuacao);

        // 2. Criar registros na tabela tentativas_pontuacao para cada campo
        const tentativas = Object.entries(data.formData)
          .filter(([key, value]) => value !== '' && value !== null && value !== undefined)
          .map(([chave_campo, valor]) => ({
            pontuacao_id: pontuacao.id,
            chave_campo,
            valor: typeof valor === 'number' ? valor : parseFloat(valor) || 0
          }));

        console.log('=== INSERINDO TENTATIVAS ===');
        console.log('Tentativas a serem inseridas:', tentativas);

        if (tentativas.length > 0) {
          const { error: tentativasError } = await supabase
            .from('tentativas_pontuacao')
            .insert(tentativas);

          if (tentativasError) {
            console.error('=== ERRO AO CRIAR TENTATIVAS ===');
            console.error('Error creating tentativas:', tentativasError);
            throw tentativasError;
          }

          console.log('=== TENTATIVAS CRIADAS COM SUCESSO ===');
          console.log('Created tentativas:', tentativas);
        } else {
          console.log('=== NENHUMA TENTATIVA PARA INSERIR ===');
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
      console.log('Mutation success data:', data);
      console.log('Mutation variables:', variables);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['athlete-scores', variables.athleteId, variables.modalityId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['modality-scores', variables.modalityId] 
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
