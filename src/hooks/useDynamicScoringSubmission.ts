
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

        // NOVA LÓGICA: Verificar configuração de baterias no modelo de configuração
        const { data: modeloConfig, error: modeloConfigError } = await supabase
          .from('modelos_modalidade')
          .select('modalidade_id')
          .eq('id', data.modeloId)
          .single();

        if (modeloConfigError) {
          console.error('Error fetching modelo config:', modeloConfigError);
          throw modeloConfigError;
        }

        // Buscar configuração real da modalidade
        const { data: modalidadeConfig, error: modalidadeConfigError } = await supabase
          .from('modalidades')
          .select('*')
          .eq('id', modeloConfig.modalidade_id)
          .single();

        if (modalidadeConfigError) {
          console.error('Error fetching modalidade config:', modalidadeConfigError);
          throw modalidadeConfigError;
        }

        console.log('Modalidade configuration:', modalidadeConfig);

        // Determinar se usa baterias baseado nos campos E na configuração da modalidade
        const bateriaConfigField = campos?.find(campo => 
          campo.chave_campo === 'baterias' && 
          campo.tipo_input === 'checkbox'
        );
        
        // APENAS considerar baterias se estiver explicitamente configurado nos campos
        const usesBaterias = bateriaConfigField?.metadados?.baterias === true;

        console.log('=== VERIFICAÇÃO DE BATERIAS ===');
        console.log('Bateria config field found:', bateriaConfigField);
        console.log('Uses baterias (from fields):', usesBaterias);
        console.log('Provided bateriaId:', data.bateriaId);

        // Se a modalidade NÃO usa baterias, remover qualquer referência a bateria
        if (!usesBaterias) {
          console.log('MODALIDADE NÃO USA BATERIAS - Removendo referências de bateria');
          // Remove bateriaId from data to prevent it being used
          delete (data as any).bateriaId;
        }

        // Calcular valor_pontuacao principal a partir dos dados do formulário
        const valorPontuacao = calculateMainScore(data.formData, campos);
        console.log('Calculated valor_pontuacao:', valorPontuacao);

        const raia = data.formData.raia || data.formData.numero_raia || data.raia || null;
        const observacoes = data.formData.notes || data.observacoes || null;

        // Create clean data object - NUNCA incluir numero_bateria se a modalidade não usa baterias
        const cleanDataForDb: any = {
          eventId: data.eventId,
          modalityId: data.modalityId,
          judgeId: data.judgeId,
          modeloId: data.modeloId,
          raia,
          observacoes
        };

        // APENAS incluir numero_bateria se a modalidade realmente usa baterias E temos o valor
        if (usesBaterias && data.bateriaId !== undefined && data.bateriaId !== null) {
          cleanDataForDb.numero_bateria = data.bateriaId;
          console.log('Including numero_bateria for bateria-enabled modality:', data.bateriaId);
        } else {
          console.log('Skipping numero_bateria - modality does not use baterias or no bateriaId provided');
        }

        console.log('Clean data for DB (team scoring):', cleanDataForDb);
        console.log('Uses baterias:', usesBaterias, '- numero_bateria included:', 'numero_bateria' in cleanDataForDb);

        // Handle team scoring
        if (data.equipeId) {
          console.log('--- Submissão para Equipe ---', { equipeId: data.equipeId });

          const teamDataForDb = {
            ...cleanDataForDb,
            athleteId: data.athleteId,
            equipeId: data.equipeId,
          };

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
          ...cleanDataForDb,
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
        console.error('=== ERROR IN TEAM SUBMISSION ===');
        console.error('Error in mutation:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log('=== TEAM MUTATION SUCCESS ===');
      
      // Invalidate team-specific queries
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
      
      toast.success('Pontuação da equipe registrada com sucesso!');
    },
    onError: (error) => {
      console.error('=== TEAM MUTATION ERROR ===');
      console.error('Error submitting team score:', error);
      
      let errorMessage = 'Erro ao registrar pontuação da equipe';
      
      if (error?.message?.includes('bateria_id') || error?.message?.includes('numero_bateria')) {
        errorMessage = 'Erro: Esta modalidade não está configurada para usar baterias. Verifique a configuração do modelo.';
      } else if (error?.message?.includes('constraint')) {
        errorMessage = 'Erro de restrição no banco de dados. Verifique se os dados da equipe estão corretos.';
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
