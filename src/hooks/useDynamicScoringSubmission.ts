
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

        // Unified data preparation for both team and individual
        const baseDataForDb = {
          eventId: data.eventId,
          modalityId: data.modalityId,
          judgeId: data.judgeId,
          modeloId: data.modeloId,
          raia,
          observacoes,
          numero_bateria: data.bateriaId || null, // Always use numero_bateria consistently
        };

        console.log('Base data for DB:', baseDataForDb);

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

          // Use the unified upsertPontuacao function for each team member
          const pontuacoes = [];
          
          for (const member of membersToScore) {
            const memberDataForDb = {
              ...baseDataForDb,
              athleteId: member.atleta_id,
              equipeId: data.equipeId,
            };
            
            console.log(`Upserting score for team member ${member.atleta_id}:`, memberDataForDb);
            
            const pontuacao = await upsertPontuacao(memberDataForDb, valorPontuacao);
            pontuacoes.push(pontuacao);
          }

          // Use the representative athlete's score for tentativas
          const representativeScore = pontuacoes.find(p => p.atleta_id === data.athleteId) || pontuacoes[0];
          
          if (!representativeScore) {
            throw new Error('Nenhuma pontuação foi salva para a equipe.');
          }

          const tentativas = prepareTentativasData(data.formData, campos, representativeScore.id);
          await insertTentativas(tentativas, representativeScore.id);

          console.log('=== SUBMISSÃO DE EQUIPE CONCLUÍDA ===');
          return representativeScore;
        }

        // --- Individual submission logic ---
        console.log('--- Submissão Individual ---');
        
        const individualDataForDb = {
          ...baseDataForDb,
          athleteId: data.athleteId,
          equipeId: data.equipeId || null,
        };
        
        console.log('Individual data for DB:', individualDataForDb);
        
        const pontuacao = await upsertPontuacao(individualDataForDb, valorPontuacao);
        console.log('=== PONTUAÇÃO INDIVIDUAL SALVA ===');

        const tentativas = prepareTentativasData(data.formData, campos, pontuacao.id);
        await insertTentativas(tentativas, pontuacao.id);

        console.log('=== SUBMISSÃO INDIVIDUAL CONCLUÍDA COM SUCESSO ===');
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
      
      // More detailed error messages based on error type
      let errorMessage = 'Erro ao registrar pontuação';
      
      if (error?.message?.includes('constraint')) {
        errorMessage = 'Erro de restrição no banco de dados. Verifique se os dados estão corretos.';
      } else if (error?.message?.includes('numero_bateria')) {
        errorMessage = 'Erro com número da bateria. Verifique a configuração.';
      } else if (error?.message?.includes('upsert')) {
        errorMessage = 'Erro ao salvar pontuação. Tente novamente.';
      } else if (error?.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      toast.error(errorMessage);
    }
  });
}

// Re-export types for convenience
export type { DynamicSubmissionData } from './useDynamicScoringSubmission/types';
