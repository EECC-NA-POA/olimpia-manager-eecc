
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
      console.log('=== INICIANDO SUBMISSÃO DE PONTUAÇÃO DINÂMICA (EQUIPES - SEM BATERIA) ===');
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

        // VERIFICAR SE A MODALIDADE USA BATERIAS - APENAS pelos campos configurados
        const bateriaField = campos?.find(campo => 
          campo.chave_campo === 'baterias' || 
          campo.chave_campo === 'bateria' ||
          (campo.tipo_input === 'checkbox' && campo.metadados?.baterias === true)
        );
        
        const usesBaterias = !!bateriaField;
        
        console.log('=== VERIFICAÇÃO DE BATERIAS SIMPLIFICADA ===');
        console.log('Bateria field found:', bateriaField);
        console.log('Uses baterias:', usesBaterias);
        
        // SE NÃO USA BATERIAS, REMOVER QUALQUER REFERÊNCIA
        if (!usesBaterias) {
          console.log('MODALIDADE NÃO USA BATERIAS - Removendo TODAS as referências');
          // Remove todas as possíveis referências a bateria
          delete (data as any).bateriaId;
          delete (data as any).numeroBateria;
          delete (data as any).numero_bateria;
          delete (data as any).bateria_id;
        }

        // Calcular valor_pontuacao principal a partir dos dados do formulário
        const valorPontuacao = calculateMainScore(data.formData, campos);
        console.log('Calculated valor_pontuacao:', valorPontuacao);

        const raia = data.formData.raia || data.formData.numero_raia || data.raia || null;
        const observacoes = data.formData.notes || data.observacoes || null;

        // Create clean data object - NUNCA incluir qualquer campo de bateria se não usa baterias
        const cleanDataForDb: any = {
          eventId: data.eventId,
          modalityId: data.modalityId,
          judgeId: data.judgeId,
          modeloId: data.modeloId,
          raia,
          observacoes
        };

        console.log('Clean data for DB (NO BATERIA):', cleanDataForDb);

        // Handle team scoring
        if (data.equipeId) {
          console.log('--- Submissão para Equipe (SEM BATERIA) ---', { equipeId: data.equipeId });

          const teamDataForDb = {
            ...cleanDataForDb,
            athleteId: data.athleteId,
            equipeId: data.equipeId,
          };

          console.log('Team data for DB (NO BATERIA):', teamDataForDb);

          const pontuacao = await upsertPontuacao(teamDataForDb, valorPontuacao, usesBaterias);
          console.log('=== TEAM SCORE SAVED (NO BATERIA) ===');

          const tentativas = prepareTentativasData(data.formData, campos, pontuacao.id);
          await insertTentativas(tentativas, pontuacao.id);

          console.log('=== TEAM SUBMISSION COMPLETED (NO BATERIA) ===');
          return pontuacao;
        }

        // Handle individual scoring (fallback)
        console.log('--- Individual Submission (fallback - NO BATERIA) ---');

        const individualDataForDb = {
          ...cleanDataForDb,
          athleteId: data.athleteId,
          equipeId: null,
        };

        console.log('Individual data for DB (NO BATERIA):', individualDataForDb);

        const pontuacao = await upsertPontuacao(individualDataForDb, valorPontuacao, usesBaterias);
        console.log('=== INDIVIDUAL SCORE SAVED (NO BATERIA) ===');

        const tentativas = prepareTentativasData(data.formData, campos, pontuacao.id);
        await insertTentativas(tentativas, pontuacao.id);

        console.log('=== INDIVIDUAL SUBMISSION COMPLETED (NO BATERIA) ===');
        return pontuacao;

      } catch (error) {
        console.error('=== ERROR IN TEAM SUBMISSION (NO BATERIA) ===');
        console.error('Error in mutation:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log('=== TEAM MUTATION SUCCESS (NO BATERIA) ===');
      
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
      console.error('=== TEAM MUTATION ERROR (NO BATERIA) ===');
      console.error('Error submitting team score:', error);
      
      let errorMessage = 'Erro ao registrar pontuação da equipe';
      
      if (error?.message?.includes('bateria')) {
        errorMessage = 'ERRO: Esta modalidade não usa baterias. Problema na configuração do sistema.';
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
