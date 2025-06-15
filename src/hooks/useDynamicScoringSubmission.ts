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

        // TEAM SCORING LOGIC
        if (data.equipeId) {
          console.log('--- Submissão para Equipe ---', { equipeId: data.equipeId });
          
          const { data: teamMembers, error: teamMembersError } = await supabase
            .from('inscricoes_modalidades')
            .select('atleta_id')
            .eq('evento_id', data.eventId)
            .eq('modalidade_id', data.modalityId)
            .eq('equipe_id', data.equipeId);

          if (teamMembersError) throw teamMembersError;
          if (!teamMembers || teamMembers.length === 0) throw new Error('Nenhum membro encontrado para a equipe.');

          // Check for existing records for this team in this context (bateria, etc.)
          const existingScoresQuery = supabase
            .from('pontuacoes')
            .select('id, atleta_id')
            .eq('evento_id', data.eventId)
            .eq('modalidade_id', data.modalityId)
            .eq('equipe_id', data.equipeId)
            .in('atleta_id', teamMembers.map(m => m.atleta_id));
          
          if (data.bateriaId) {
            existingScoresQuery.eq('bateria_id', data.bateriaId);
          } else {
            existingScoresQuery.is('bateria_id', null);
          }
          
          const { data: existingRecords, error: checkError } = await existingScoresQuery;

          if (checkError) throw checkError;

          let pontuacoes_result;

          if (existingRecords && existingRecords.length > 0) {
            console.log(`Updating ${existingRecords.length} existing scores for team.`);
            const updateData = {
              valor_pontuacao: valorPontuacao,
              dados_pontuacao: data.formData,
              observacoes,
              juiz_id: data.judgeId,
              data_registro: new Date().toISOString(),
              modelo_id: data.modeloId,
              raia: raia,
            };
            const { data: updatedScores, error: updateError } = await supabase
              .from('pontuacoes')
              .update(updateData)
              .in('id', existingRecords.map(r => r.id))
              .select();
            if (updateError) throw updateError;
            pontuacoes_result = updatedScores;
          } else {
            console.log(`Inserting new scores for ${teamMembers.length} team members.`);
            const scoresToInsert = teamMembers.map(member => ({
              evento_id: data.eventId,
              modalidade_id: data.modalityId,
              atleta_id: member.atleta_id,
              equipe_id: data.equipeId,
              juiz_id: data.judgeId,
              modelo_id: data.modeloId,
              bateria_id: data.bateriaId || null,
              raia: raia,
              valor_pontuacao: valorPontuacao,
              dados_pontuacao: data.formData,
              observacoes,
              data_registro: new Date().toISOString(),
            }));
            const { data: insertedScores, error: insertError } = await supabase
              .from('pontuacoes')
              .insert(scoresToInsert)
              .select();
            if (insertError) throw insertError;
            pontuacoes_result = insertedScores;
          }

          if (!pontuacoes_result || pontuacoes_result.length === 0) {
            throw new Error("Falha ao salvar pontuação da equipe.");
          }

          const pontuacao = pontuacoes_result[0];
          console.log('Representative score for team:', pontuacao);

          const tentativas = prepareTentativasData(data.formData, campos, pontuacao.id);
          await insertTentativas(tentativas, pontuacao.id);

          console.log('=== SUBMISSÃO DE EQUIPE CONCLUÍDA ===');
          return pontuacao;
        }

        // INDIVIDUAL SCORING LOGIC
        console.log('--- Submissão Individual ---');
        const enhancedData = {
          ...data,
          raia: raia,
          observacoes: observacoes
        };
        
        const pontuacao = await upsertPontuacao(enhancedData, valorPontuacao);
        console.log('=== PONTUAÇÃO INDIVIDUAL SALVA ===');

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
