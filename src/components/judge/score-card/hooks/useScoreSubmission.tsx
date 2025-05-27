
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
      console.log('Starting score submission with data:', formData);
      
      // Validate required fields
      validateScoreSubmission(eventId, judgeId, athlete);
      
      // Prepare score data based on rule type
      const { scoreData } = prepareScoreData(formData, modalityRule, scoreType);
      console.log('Prepared score data:', scoreData);
      
      // Prepare final data structure
      const finalScoreData = prepareFinalScoreData(
        scoreData,
        formData,
        judgeId,
        eventId!,
        modalityId,
        athlete
      );
      console.log('Final prepared data:', finalScoreData);
      
      // Save to database
      const result = await saveScoreToDatabase(finalScoreData, eventId!, modalityId, athlete);
      console.log('Database save result:', result);
      
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
      console.error('Error submitting score:', error);
      toast.error(`Erro ao registrar pontuação: ${error.message || 'Erro desconhecido'}`);
    }
  });

  return { submitScoreMutation };
}
