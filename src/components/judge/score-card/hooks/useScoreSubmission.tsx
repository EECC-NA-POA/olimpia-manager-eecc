
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { validateScoreSubmission } from './utils/scoreValidation';
import { prepareScoreData, prepareFinalScoreData } from './utils/scoreDataPreparation';
import { saveScoreToDatabase } from './utils/scoreDatabase';

interface AthleteData {
  atleta_id: string;
  equipe_id?: number;
}

export function useScoreSubmission(
  eventId: string | null,
  modalityId: number,
  athlete: AthleteData,
  judgeId: string,
  scoreType: 'tempo' | 'distancia' | 'pontos',
  modalityRule?: any
) {
  const queryClient = useQueryClient();

  const submitScoreMutation = useMutation({
    mutationFn: async (formData: any) => {
      console.log('=== SCORE SUBMISSION START ===');
      console.log('Form data:', JSON.stringify(formData, null, 2));
      
      // Validate required fields
      validateScoreSubmission(eventId, judgeId, athlete);
      
      // Prepare score data based on rule type
      const { scoreData } = prepareScoreData(formData, modalityRule, scoreType);
      console.log('Prepared score data:', JSON.stringify(scoreData, null, 2));
      
      // Prepare final data structure
      const finalScoreData = prepareFinalScoreData(
        scoreData,
        formData,
        judgeId,
        eventId!,
        modalityId,
        athlete
      );
      console.log('Final prepared data:', JSON.stringify(finalScoreData, null, 2));
      
      // Save to database
      const result = await saveScoreToDatabase(finalScoreData, eventId!, modalityId, athlete);
      console.log('=== SCORE SUBMISSION SUCCESS ===');
      return result;
    },
    onSuccess: () => {
      console.log('Score submission successful, invalidating queries...');
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['scores', modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['score', athlete.atleta_id, modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['athletes', modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['modality-rankings', modalityId, eventId] });
      
      toast.success("Pontuação registrada com sucesso");
    },
    onError: (error: any) => {
      console.error('=== SCORE SUBMISSION ERROR ===');
      console.error('Error details:', error);
      
      const errorMessage = error?.message || 'Erro desconhecido ao registrar pontuação';
      toast.error(`Erro ao registrar pontuação: ${errorMessage}`);
    }
  });

  return { submitScoreMutation };
}
