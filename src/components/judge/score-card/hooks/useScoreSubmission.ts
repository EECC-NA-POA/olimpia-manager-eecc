
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
      console.log('Event ID:', eventId);
      console.log('Modality ID:', modalityId);
      console.log('Athlete:', JSON.stringify(athlete, null, 2));
      console.log('Judge ID:', judgeId);
      console.log('Score Type:', scoreType);
      
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
      try {
        const result = await saveScoreToDatabase(finalScoreData, eventId!, modalityId, athlete);
        console.log('Database save successful:', JSON.stringify(result, null, 2));
        console.log('=== SCORE SUBMISSION SUCCESS ===');
        return result;
      } catch (dbError: any) {
        console.error('=== SCORE SUBMISSION FAILED ===');
        console.error('Database error details:', JSON.stringify(dbError, null, 2));
        throw dbError;
      }
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
      console.error('Error object:', JSON.stringify(error, null, 2));
      console.error('Error message:', error?.message);
      
      const errorMessage = error?.message || 'Erro desconhecido ao registrar pontuação';
      
      // Show specific error messages
      if (errorMessage.includes('ON CONFLICT specification')) {
        toast.error('Erro de configuração do banco de dados. As constraints necessárias não estão configuradas corretamente.');
      } else if (errorMessage.includes('FROM-clause') || errorMessage.includes('missing FROM-clause entry')) {
        toast.error('Erro no trigger do banco de dados. Contacte o administrador sobre o erro SQL.');
      } else if (errorMessage.includes('trigger') || errorMessage.includes('replicação')) {
        toast.error('Erro no sistema de replicação de pontuações. A configuração do servidor precisa ser corrigida.');
      } else if (errorMessage.includes('constraint')) {
        toast.error('Erro de constraint do banco de dados. Verifique se todos os dados estão corretos.');
      } else {
        toast.error(`Erro ao registrar pontuação: ${errorMessage}`);
      }
    }
  });

  return { submitScoreMutation };
}
