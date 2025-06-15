
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
        if (data.equipeId) {
          console.log('--- Submissão para Equipe ---', { equipeId: data.equipeId });
          
          const { data: teamMembersQuery, error: teamError } = await supabase
            .from('atletas_equipes')
            .select('atleta_id')
            .eq('equipe_id', data.equipeId);

          if (teamError) {
            console.error('Error fetching team members:', teamError);
            toast.error(`Erro ao buscar membros da equipe: ${teamError.message}`);
            throw teamError;
          }

          let membersToScore = teamMembersQuery;
          if (!membersToScore || membersToScore.length === 0) {
            console.warn('Nenhum membro encontrado para a equipe, pontuando apenas o atleta representante.');
            toast.info('A equipe não possui membros, pontuando apenas o representante.');
            membersToScore = [{ atleta_id: data.athleteId }];
          }
          
          console.log('Team members to score:', membersToScore);

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
            console.error('Falha ao encontrar a pontuação do atleta representante após o salvamento.', pontuacoes);
            // Attempt to find any score if representative is not there
             const anyScore = pontuacoes && pontuacoes[0];
             if (!anyScore) {
                throw new Error('Nenhuma pontuação foi salva para a equipe.');
             }
             const tentativas = prepareTentativasData(data.formData, campos, anyScore.id);
             await insertTentativas(tentativas, anyScore.id);
             console.log('=== SUBMISSÃO DE EQUIPE CONCLUÍDA (com score genérico) ===');
             return anyScore;
          }

          const tentativas = prepareTentativasData(data.formData, campos, representativeScore.id);
          await insertTentativas(tentativas, representativeScore.id);

          console.log('=== SUBMISSÃO DE EQUIPE CONCLUÍDA ===');
          return representativeScore;
        }

        // --- Individual submission logic (existing logic) ---
        console.log('--- Submissão Individual ---');
        const dataForDb = {
          eventId: data.eventId,
          modalityId: data.modalityId,
          athleteId: data.athleteId,
          equipeId: data.equipeId,
          judgeId: data.judgeId,
          modeloId: data.modeloId,
          raia,
          observacoes,
          numero_bateria: data.bateriaId || null,
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
