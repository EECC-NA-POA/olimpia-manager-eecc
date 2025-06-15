
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { calculateMainScore } from './useDynamicScoringSubmission/scoreCalculation';
import { prepareTentativasData } from './useDynamicScoringSubmission/tentativasPreparation';
import { upsertPontuacao, insertTentativas } from './useDynamicScoringSubmission/pontuacaoOperations';
import type { DynamicSubmissionData } from './useDynamicScoringSubmission/types';

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

        // Prepare base data structure
        const baseDataForDb = {
          eventId: data.eventId,
          modalityId: data.modalityId,
          judgeId: data.judgeId,
          modeloId: data.modeloId,
          raia,
          observacoes,
          numero_bateria: data.bateriaId || null,
        };

        console.log('Base data for DB:', baseDataForDb);

        // Handle team scoring
        if (data.equipeId) {
          console.log('--- Submissão para Equipe ---', { equipeId: data.equipeId });
          
          const { data: teamMembersQuery, error: teamError } = await supabase
            .from('atletas_equipes')
            .select('atleta_id')
            .eq('equipe_id', data.equipeId);

          if (teamError) {
            console.error('Error fetching team members:', teamError);
            throw teamError;
          }

          let membersToScore = teamMembersQuery;
          if (!membersToScore || membersToScore.length === 0) {
            console.warn('No team members found, scoring only representative athlete');
            membersToScore = [{ atleta_id: data.athleteId }];
          }
          
          console.log('Team members to score:', membersToScore);

          // Score each team member
          const pontuacoes = [];
          
          for (const member of membersToScore) {
            const memberDataForDb = {
              ...baseDataForDb,
              athleteId: member.atleta_id,
              equipeId: data.equipeId,
            };
            
            console.log(`Scoring team member ${member.atleta_id}:`, memberDataForDb);
            
            const pontuacao = await upsertPontuacao(memberDataForDb, valorPontuacao);
            pontuacoes.push(pontuacao);
          }

          // Use representative athlete's score for tentativas
          const representativeScore = pontuacoes.find(p => p.atleta_id === data.athleteId) || pontuacoes[0];
          
          if (!representativeScore) {
            throw new Error('No scores were saved for the team.');
          }

          const tentativas = prepareTentativasData(data.formData, campos, representativeScore.id);
          await insertTentativas(tentativas, representativeScore.id);

          console.log('=== TEAM SUBMISSION COMPLETED ===');
          return representativeScore;
        }

        // Handle individual scoring
        console.log('--- Individual Submission ---');
        
        const individualDataForDb = {
          ...baseDataForDb,
          athleteId: data.athleteId,
          equipeId: data.equipeId || null,
        };
        
        console.log('Individual data for DB:', individualDataForDb);
        
        const pontuacao = await upsertPontuacao(individualDataForDb, valorPontuacao);
        console.log('=== INDIVIDUAL SCORE SAVED ===');

        const tentativas = prepareTentativasData(data.formData, campos, pontuacao.id);
        await insertTentativas(tentativas, pontuacao.id);

        console.log('=== INDIVIDUAL SUBMISSION COMPLETED ===');
        return pontuacao;

      } catch (error) {
        console.error('=== ERROR IN SUBMISSION ===');
        console.error('Error in mutation:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log('=== MUTATION SUCCESS ===');
      
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
      console.error('=== MUTATION ERROR ===');
      console.error('Error submitting dynamic score:', error);
      
      let errorMessage = 'Erro ao registrar pontuação';
      
      if (error?.message?.includes('constraint')) {
        errorMessage = 'Erro de restrição no banco de dados. Verifique se os dados estão corretos.';
      } else if (error?.message?.includes('numero_bateria')) {
        errorMessage = 'Erro com número da bateria. Verifique a configuração.';
      } else if (error?.message?.includes('column') && error?.message?.includes('does not exist')) {
        errorMessage = 'Erro de configuração do banco de dados. Entre em contato com o suporte.';
      } else if (error?.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      toast.error(errorMessage);
    }
  });
}

export type { DynamicSubmissionData } from './useDynamicScoringSubmission/types';
