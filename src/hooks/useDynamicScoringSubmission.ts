
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

        // VERIFICAR SE A MODALIDADE USA BATERIAS
        const bateriaField = campos?.find(campo => 
          campo.chave_campo === 'baterias' || 
          campo.chave_campo === 'bateria' ||
          (campo.tipo_input === 'checkbox' && campo.metadados?.baterias === true)
        );
        
        const usesBaterias = !!bateriaField;
        
        console.log('=== VERIFICAÇÃO DE BATERIAS ===');
        console.log('Bateria field found:', bateriaField);
        console.log('Uses baterias:', usesBaterias);

        // Calcular valor_pontuacao principal
        const valorPontuacao = calculateMainScore(data.formData, campos);
        console.log('Calculated valor_pontuacao:', valorPontuacao);

        const raia = data.formData.raia || data.formData.numero_raia || data.raia || null;
        const observacoes = data.formData.notes || data.observacoes || null;

        // Create base data object - NUNCA incluir campos de bateria
        const baseDataForDb = {
          eventId: data.eventId,
          modalityId: data.modalityId,
          judgeId: data.judgeId,
          modeloId: data.modeloId,
          raia,
          observacoes
        };

        console.log('Base data for DB:', baseDataForDb);

        // Handle team scoring
        if (data.equipeId) {
          console.log('--- Submissão para Equipe ---', { equipeId: data.equipeId });

          const teamDataForDb = {
            ...baseDataForDb,
            athleteId: data.athleteId,
            equipeId: data.equipeId,
          };

          // NUNCA incluir numero_bateria para equipes sem baterias
          if (usesBaterias && data.numeroBateria !== undefined && data.numeroBateria !== null) {
            teamDataForDb.numeroBateria = data.numeroBateria;
            console.log('Added numeroBateria for bateria-enabled modality:', data.numeroBateria);
          } else {
            console.log('Modalidade de equipe SEM baterias - numero_bateria não será incluído');
          }

          console.log('Team data for DB:', teamDataForDb);

          const pontuacao = await upsertPontuacao(teamDataForDb, valorPontuacao, usesBaterias);
          console.log('=== TEAM SCORE SAVED ===');

          const tentativas = prepareTentativasData(data.formData, campos, pontuacao.id);
          await insertTentativas(tentativas, pontuacao.id);

          console.log('=== TEAM SUBMISSION COMPLETED ===');
          return pontuacao;
        }

        // Handle individual scoring (fallback)
        console.log('--- Individual Submission (fallback) ---');

        const individualDataForDb = {
          ...baseDataForDb,
          athleteId: data.athleteId,
          equipeId: null,
        };

        // NUNCA incluir numero_bateria para modalidades sem baterias
        if (usesBaterias && data.numeroBateria !== undefined && data.numeroBateria !== null) {
          individualDataForDb.numeroBateria = data.numeroBateria;
          console.log('Added numeroBateria for bateria-enabled modality:', data.numeroBateria);
        }

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
