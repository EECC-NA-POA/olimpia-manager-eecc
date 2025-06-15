
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { calculateMainScore } from './useDynamicScoringSubmission/scoreCalculation';
import { prepareTentativasData } from './useDynamicScoringSubmission/tentativasPreparation';
import { upsertPontuacao, insertTentativas } from './useDynamicScoringSubmission/pontuacaoOperations';
import type { DynamicSubmissionData } from './useDynamicScoringSubmission/types';

// Update the interface to include observacoes
interface ExtendedDynamicSubmissionData extends DynamicSubmissionData {
  observacoes?: string | null;
}

export function useDynamicScoringSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ExtendedDynamicSubmissionData) => {
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
        
        const raia = data.formData.raia || data.formData.numero_raia || data.raia || null;
        const observacoes = data.formData.notes || data.observacoes || null;

        // For teams, we handle score replication on the client-side
        // to avoid relying on a potentially faulty database trigger.
        if (data.equipeId) {
          console.log('--- Submissão para Equipe ---', { equipeId: data.equipeId });
          
          const { data: teamMembers, error: membersError } = await supabase
            .from('inscricoes_modalidades')
            .select('atleta_id')
            .eq('evento_id', data.eventId)
            .eq('modalidade_id', data.modalityId)
            .eq('equipe_id', data.equipeId);

          if (membersError) throw membersError;

          const membersToScore = (teamMembers && teamMembers.length > 0) 
            ? teamMembers 
            : [{ atleta_id: data.athleteId }]; // Fallback to representative if team has no members

          const scoresPayload = membersToScore.map(member => ({
            evento_id: data.eventId,
            modalidade_id: data.modalityId,
            atleta_id: member.atleta_id,
            equipe_id: data.equipeId,
            juiz_id: data.judgeId,
            modelo_id: data.modeloId,
            valor_pontuacao: valorPontuacao,
            unidade: 'pontos',
            observacoes: observacoes,
            data_registro: new Date().toISOString(),
            numero_bateria: data.bateriaId || null,
            raia: raia,
          }));

          console.log('Batch upserting scores for team:', scoresPayload);

          const { data: pontuacoes, error: upsertError } = await supabase
            .from('pontuacoes')
            .upsert(scoresPayload, {
              onConflict: 'atleta_id,modalidade_id,evento_id,juiz_id,modelo_id,numero_bateria',
            })
            .select();

          if (upsertError) {
            console.error('Error batch upserting team scores:', upsertError);
            throw upsertError;
          }

          const representativeScore = pontuacoes?.find(p => p.atleta_id === data.athleteId);
          if (!representativeScore) {
            throw new Error('Falha ao encontrar a pontuação do atleta representante após o salvamento.');
          }

          const tentativas = prepareTentativasData(data.formData, campos, representativeScore.id);
          await insertTentativas(tentativas, representativeScore.id);

          console.log('=== SUBMISSÃO DE EQUIPE CONCLUÍDA ===');
          return representativeScore;
        }

        // --- Individual submission logic (existing logic) ---
        console.log('--- Submissão Individual ---');
        const { bateriaId, ...restOfData } = data;
        const dataForDb = {
          ...restOfData,
          raia,
          observacoes,
          numero_bateria: bateriaId,
        };
        
        const pontuacao = await upsertPontuacao(dataForDb as any, valorPontuacao);
        console.log('=== PONTUAÇÃO SALVA ===');

        const tentativas = prepareTentativasData(data.formData, campos, pontuacao.id);
        await insertTentativas(tentativas, pontuacao.id);

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
      queryClient.invalidateQueries({ queryKey: ['team-score', variables.equipeId, variables.modalityId, variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['athlete-scores', variables.athleteId, variables.modalityId] });
      queryClient.invalidateQueries({ 
        queryKey: ['modality-scores', variables.modalityId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['dynamic-scores', variables.modalityId, variables.eventId, variables.bateriaId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['dynamic-score', variables.athleteId, variables.modalityId, variables.eventId, variables.judgeId, variables.modeloId] 
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
