
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { prepareScoreData, prepareFinalScoreData } from './utils/scoreDataPreparation';
import { useModalityRules } from '../../tabs/scores/hooks/useModalityRules';

interface AthleteData {
  atleta_id: string;
  equipe_id?: number;
}

export function useScoreSubmission(
  eventId: string | null,
  modalityId: number,
  athlete: AthleteData,
  judgeId: string,
  scoreType: 'tempo' | 'distancia' | 'pontos'
) {
  const queryClient = useQueryClient();
  
  // Get modality rules to determine the actual scoring type
  const { data: modalityRule } = useModalityRules(modalityId);

  const submitScoreMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (!eventId) {
        throw new Error('Event ID is required');
      }

      console.log('Submit score mutation - Form data:', formData);
      console.log('Submit score mutation - Modality rule:', modalityRule);
      console.log('Submit score mutation - Score type:', scoreType);

      // Determine the effective score type based on the modality rule
      let effectiveScoreType = scoreType;
      if (modalityRule?.regra_tipo) {
        switch (modalityRule.regra_tipo) {
          case 'tempo':
            effectiveScoreType = 'tempo';
            break;
          case 'distancia':
            effectiveScoreType = 'distancia';
            break;
          case 'pontos':
          case 'sets':
          case 'arrows':
          default:
            effectiveScoreType = 'pontos';
            break;
        }
      }

      console.log('Effective score type for processing:', effectiveScoreType);

      // Prepare score data
      const { scoreData } = prepareScoreData(formData, modalityRule, effectiveScoreType);
      
      // Prepare final data for database
      const finalData = prepareFinalScoreData(
        scoreData,
        formData,
        judgeId,
        eventId,
        modalityId,
        athlete
      );

      console.log('Final data to be inserted:', finalData);

      // Check if score already exists
      const { data: existingScore } = await supabase
        .from('pontuacoes')
        .select('id')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('atleta_id', athlete.atleta_id)
        .maybeSingle();

      if (existingScore) {
        // Update existing score
        const { error } = await supabase
          .from('pontuacoes')
          .update(finalData)
          .eq('id', existingScore.id);

        if (error) {
          console.error('Error updating score:', error);
          throw error;
        }
      } else {
        // Insert new score
        const { error } = await supabase
          .from('pontuacoes')
          .insert([finalData]);

        if (error) {
          console.error('Error inserting score:', error);
          throw error;
        }
      }

      return finalData;
    },
    onSuccess: () => {
      toast.success('Pontuação salva com sucesso!');
      
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ['athlete-scores'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['modality-rankings'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['score', athlete.atleta_id, modalityId, eventId] 
      });
    },
    onError: (error: Error) => {
      console.error('Error submitting score:', error);
      toast.error(`Erro ao salvar pontuação: ${error.message}`);
    },
  });

  return { submitScoreMutation };
}
