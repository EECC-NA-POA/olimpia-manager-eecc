
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

        // Check if this modality uses baterias by looking at the campos
        const usesBaterias = campos?.some(campo => 
          campo.chave_campo.toLowerCase().includes('bateria') ||
          campo.chave_campo.toLowerCase().includes('heat') ||
          campo.chave_campo.toLowerCase().includes('numero_bateria') ||
          (campo.metadados && (campo.metadados as any).baterias === true)
        ) || false;

        console.log('Modality uses baterias?', usesBaterias);

        // Calcular valor_pontuacao principal a partir dos dados do formulário
        const valorPontuacao = calculateMainScore(data.formData, campos);
        console.log('Calculated valor_pontuacao:', valorPontuacao);

        const raia = data.formData.raia || data.formData.numero_raia || data.raia || null;
        const observacoes = data.formData.notes || data.observacoes || null;

        // CRITICAL: Create clean data object with ONLY valid database fields
        // For modalities that don't use baterias, completely exclude numero_bateria
        const cleanDataForDb = {
          eventId: data.eventId,
          modalityId: data.modalityId,
          judgeId: data.judgeId,
          modeloId: data.modeloId,
          raia,
          observacoes,
          // Only include numero_bateria if the modality actually uses baterias
          ...(usesBaterias && { numero_bateria: data.bateriaId ?? null })
        };

        console.log('Clean data for DB (bateria fields only if needed):', cleanDataForDb);
        console.log('Uses baterias:', usesBaterias, '- numero_bateria included:', 'numero_bateria' in cleanDataForDb);

        // Handle team scoring
        if (data.equipeId) {
          console.log('--- Submissão para Equipe ---', { equipeId: data.equipeId });

          const teamDataForDb = {
            ...cleanDataForDb,
            athleteId: data.athleteId,
            equipeId: data.equipeId,
          };

          console.log('Team data for DB (conditional bateria fields):', teamDataForDb);

          const pontuacao = await upsertPontuacao(teamDataForDb, valorPontuacao);
          console.log('=== TEAM SCORE SAVED ===');

          const tentativas = prepareTentativasData(data.formData, campos, pontuacao.id);
          await insertTentativas(tentativas, pontuacao.id);

          console.log('=== TEAM SUBMISSION COMPLETED ===');
          return pontuacao;
        }

        // Handle individual scoring
        console.log('--- Individual Submission ---');

        const individualDataForDb = {
          ...cleanDataForDb,
          athleteId: data.athleteId,
          equipeId: data.equipeId || null,
        };

        console.log('Individual data for DB (conditional bateria fields):', individualDataForDb);

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
      
      if (error?.message?.includes('bateria_id')) {
        errorMessage = 'Erro de configuração: Esta modalidade não usa baterias, mas está tentando processar campos de bateria. Entre em contato com o suporte técnico.';
      } else if (error?.message?.includes('constraint')) {
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
