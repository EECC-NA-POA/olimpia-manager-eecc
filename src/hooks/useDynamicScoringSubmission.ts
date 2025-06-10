
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { calculateMainScore } from './useDynamicScoringSubmission/scoreCalculation';
import { prepareTentativasData } from './useDynamicScoringSubmission/tentativasPreparation';
import { upsertPontuacao, insertTentativas } from './useDynamicScoringSubmission/pontuacaoOperations';
import type { DynamicSubmissionData } from './useDynamicScoringSubmission/types';

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
        const valorPontuacao = calculateMainScore(data.formData, campos);
        console.log('Calculated valor_pontuacao:', valorPontuacao);

        // Get bateria number if bateriaId is provided
        let numeroBateria: number | null = null;
        if (data.bateriaId) {
          const { data: bateriaData, error: bateriaError } = await supabase
            .from('baterias')
            .select('numero')
            .eq('id', data.bateriaId)
            .single();

          if (bateriaError) {
            console.error('Error fetching bateria:', bateriaError);
            throw new Error('Erro ao buscar dados da bateria');
          }

          numeroBateria = bateriaData.numero;
          console.log('Using bateria number:', numeroBateria);
        }

        // Prepare pontuacao data with correct structure
        const pontuacaoData = {
          evento_id: data.eventId,
          modalidade_id: data.modalityId,
          atleta_id: data.athleteId,
          equipe_id: null, // For individual scores
          juiz_id: data.judgeId,
          valor_pontuacao: valorPontuacao,
          unidade: 'pontos', // Default for dynamic scoring
          observacoes: data.formData.observacoes || null,
          numero_bateria: numeroBateria,
          modelo_id: data.modeloId,
          raia: data.formData.raia || null,
          data_registro: new Date().toISOString()
        };

        console.log('Upserting pontuacao data:', pontuacaoData);

        // Upsert pontuacao
        const { data: pontuacao, error: pontuacaoError } = await supabase
          .from('pontuacoes')
          .upsert(pontuacaoData, {
            onConflict: 'atleta_id,modalidade_id,evento_id,juiz_id,modelo_id,numero_bateria',
          })
          .select()
          .single();

        if (pontuacaoError) {
          console.error('Error upserting pontuacao:', pontuacaoError);
          throw pontuacaoError;
        }

        console.log('=== PONTUAÇÃO SALVA COM SUCESSO ===');
        console.log('Pontuação:', pontuacao);

        // Preparar e inserir tentativas
        const tentativas = prepareTentativasData(data.formData, campos, pontuacao.id);
        console.log('=== INSERINDO TENTATIVAS ===');
        console.log('Tentativas a serem inseridas:', tentativas);

        await insertTentativas(tentativas);

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

// Re-export types for convenience
export type { DynamicSubmissionData } from './useDynamicScoringSubmission/types';
