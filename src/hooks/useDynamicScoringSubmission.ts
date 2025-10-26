
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { prepareTentativasData } from './useDynamicScoringSubmission/tentativasPreparation';
import { upsertPontuacao, insertTentativas } from './useDynamicScoringSubmission/pontuacaoOperations';
import type { DynamicSubmissionData } from './useDynamicScoringSubmission/types';

interface ExtendedDynamicSubmissionData extends DynamicSubmissionData {
  observacoes?: string | null;
  numeroBateria?: number | null;
}

export function useDynamicScoringSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ExtendedDynamicSubmissionData) => {
      console.log('=== INICIANDO SUBMISSÃO DE PONTUAÇÃO DINÂMICA (CORRIGIDA) ===');
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

        // Para modalidades de equipe, NUNCA usar baterias
        const usesBaterias = data.equipeId ? false : false; // Force false for now
        
        console.log('Uses baterias (sempre false para equipes):', usesBaterias);

        const observacoes = data.formData.notes || data.observacoes || null;
        const numeroBateria = data.numeroBateria || null;

        // Create base data object - colunas 'raia', 'bateria', 'valor_pontuacao' e 'posicao_final' foram removidas
        const baseDataForDb = {
          eventId: data.eventId,
          modalityId: data.modalityId,
          judgeId: data.judgeId,
          modeloId: data.modeloId,
          observacoes,
          numeroBateria
        };

        console.log('Base data for DB (usando numero_bateria):', baseDataForDb);

        // Handle team scoring - Register score for ALL team members
        if (data.equipeId) {
          console.log('--- Submissão para Equipe ---', { equipeId: data.equipeId });

          // Fetch all team members from atletas_equipes table
          const { data: teamMembers, error: teamMembersError } = await supabase
            .from('atletas_equipes')
            .select('atleta_id')
            .eq('equipe_id', data.equipeId);

          if (teamMembersError) {
            console.error('Error fetching team members:', teamMembersError);
            throw new Error('Erro ao buscar membros da equipe');
          }

          if (!teamMembers || teamMembers.length === 0) {
            console.error('No team members found for team:', data.equipeId);
            throw new Error('Nenhum membro encontrado para esta equipe');
          }

          console.log(`Found ${teamMembers.length} team members. Registering score for each...`);

          // Register score for each team member
          const savedScores = [];
          for (const member of teamMembers) {
            const teamDataForDb = {
              ...baseDataForDb,
              athleteId: member.atleta_id,
              equipeId: data.equipeId,
            };

            console.log('Saving score for team member:', member.atleta_id);

            const pontuacao = await upsertPontuacao(teamDataForDb, false);
            
            // Insert tentativas for this athlete
            const tentativas = prepareTentativasData(data.formData, campos, pontuacao.id);
            await insertTentativas(tentativas, pontuacao.id);

            savedScores.push(pontuacao);
          }

          console.log(`=== TEAM SUBMISSION COMPLETED - ${savedScores.length} scores registered ===`);
          return savedScores[0]; // Return first score as reference
        }

        // Handle individual scoring
        console.log('--- Individual Submission ---');

        const individualDataForDb = {
          ...baseDataForDb,
          athleteId: data.athleteId,
          equipeId: null,
        };

        console.log('Individual data for DB:', individualDataForDb);

        const pontuacao = await upsertPontuacao(individualDataForDb, usesBaterias);
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
      
      // Invalidate queries - CRITICAL: Must match exact query keys including all parameters
      queryClient.invalidateQueries({ queryKey: ['team-score', variables.equipeId, variables.modalityId, variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['athlete-scores', variables.athleteId, variables.modalityId] });
      queryClient.invalidateQueries({ 
        queryKey: ['modality-scores', variables.modalityId] 
      });
      // Invalidate dynamic scores with ALL parameters to ensure UI updates
      queryClient.invalidateQueries({ 
        queryKey: ['dynamic-scores', variables.modalityId, variables.eventId, variables.bateriaId, variables.judgeId] 
      });
      // Also invalidate without optional parameters to catch all variations
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
      
      if (error?.message?.includes('bateria_id')) {
        errorMessage = 'ERRO CRÍTICO: Sistema ainda referencia campo bateria_id inexistente. Contacte o suporte técnico.';
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
