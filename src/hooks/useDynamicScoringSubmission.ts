
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
      console.log('=== INICIANDO SUBMISSÃO DE PONTUAÇÃO DINÂMICA (EQUIPES) ===');
      console.log('Dynamic scoring submission data:', data);

      try {
        // Buscar campos do modelo para determinar configurações
        const { data: campos, error: camposError } = await supabase
          .from('campos_modelo')
          .select('*')
          .eq('modelo_id', data.modeloId)
          .order('ordem_exibicao');

        if (camposError) {
          console.error('Error fetching campos:', camposError);
          throw camposError;
        }

        console.log('Campos do modelo:', campos);

        // VERIFICAÇÃO CRÍTICA: Para modalidades de equipe, NUNCA usar baterias
        console.log('=== MODALIDADE DE EQUIPE - FORÇANDO usesBaterias = false ===');
        const usesBaterias = false; // Forçar false para equipes
        
        console.log('Uses baterias (forçado para false):', usesBaterias);

        // Calcular valor_pontuacao principal
        const valorPontuacao = calculateMainScore(data.formData, campos);
        console.log('Calculated valor_pontuacao:', valorPontuacao);

        const raia = data.formData.raia || data.formData.numero_raia || data.raia || null;
        const observacoes = data.formData.notes || data.observacoes || null;

        // Create base data object - ZERO referências a bateria para modalidades de equipe
        const baseDataForDb = {
          eventId: data.eventId,
          modalityId: data.modalityId,
          judgeId: data.judgeId,
          modeloId: data.modeloId,
          raia,
          observacoes
        };

        console.log('Base data for DB (EQUIPE - NO BATTERY REFERENCES):', baseDataForDb);

        // Handle team scoring - NUNCA incluir campos de bateria
        if (data.equipeId) {
          console.log('--- Submissão para Equipe (SEM BATERIAS GARANTIDO) ---', { equipeId: data.equipeId });

          const teamDataForDb = {
            ...baseDataForDb,
            athleteId: data.athleteId,
            equipeId: data.equipeId,
          };

          console.log('Team data for DB (ZERO BATTERY FIELDS GARANTIDO):', teamDataForDb);

          // CRÍTICO: Passar usesBaterias = false SEMPRE para equipes
          const pontuacao = await upsertPontuacao(teamDataForDb, valorPontuacao, false);
          console.log('=== TEAM SCORE SAVED (NO BATTERIES GARANTIDO) ===');

          const tentativas = prepareTentativasData(data.formData, campos, pontuacao.id);
          await insertTentativas(tentativas, pontuacao.id);

          console.log('=== TEAM SUBMISSION COMPLETED (NO BATTERIES GARANTIDO) ===');
          return pontuacao;
        }

        // Handle individual scoring (fallback)
        console.log('--- Individual Submission ---');

        const individualDataForDb = {
          ...baseDataForDb,
          athleteId: data.athleteId,
          equipeId: null,
        };

        console.log('Individual data for DB:', individualDataForDb);

        const pontuacao = await upsertPontuacao(individualDataForDb, valorPontuacao, usesBaterias);
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
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['team-score', variables.equipeId, variables.modalityId, variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['athlete-scores', variables.athleteId, variables.modalityId] });
      queryClient.invalidateQueries({ 
        queryKey: ['modality-scores', variables.modalityId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['dynamic-scores', variables.modalityId, variables.eventId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['dynamic-score', variables.athleteId, variables.modalityId, variables.eventId, variables.judgeId, variables.modeloId] 
      });
      
      toast.success('Pontuação registrada com sucesso!');
    },
    onError: (error) => {
      console.error('=== MUTATION ERROR ===');
      console.error('Error submitting score:', error);
      
      let errorMessage = 'Erro ao registrar pontuação';
      
      if (error?.message?.includes('bateria_id') || error?.message?.includes('bateria')) {
        errorMessage = 'ERRO CRÍTICO: Sistema tentando usar campo de bateria inexistente. Esta modalidade não possui baterias.';
      } else if (error?.message?.includes('constraint')) {
        errorMessage = 'Erro de restrição no banco de dados. Verifique se os dados estão corretos.';
      } else if (error?.message?.includes('column') && error?.message?.includes('does not exist')) {
        errorMessage = 'Erro: Campo inexistente no banco de dados.';
      } else if (error?.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      toast.error(errorMessage);
    }
  });
}

export type { DynamicSubmissionData } from './useDynamicScoringSubmission/types';
