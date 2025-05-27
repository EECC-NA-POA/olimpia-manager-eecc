
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
      
      // Save to database with enhanced error handling
      try {
        const result = await saveScoreToDatabase(finalScoreData, eventId!, modalityId, athlete);
        console.log('Database save successful:', JSON.stringify(result, null, 2));
        console.log('=== SCORE SUBMISSION SUCCESS ===');
        return result;
      } catch (dbError: any) {
        console.error('=== SCORE SUBMISSION FAILED ===');
        console.error('Database error details:', JSON.stringify(dbError, null, 2));
        
        // Provide specific error messages for database trigger issues
        if (dbError.message?.includes('missing FROM-clause entry for table "p"')) {
          throw new Error('Erro crítico no sistema: O trigger de replicação de equipes está mal configurado no banco de dados. Esta é uma questão do servidor que requer intervenção do administrador.');
        }
        
        if (dbError.message?.includes('trigger') && dbError.message?.includes('replicação')) {
          throw new Error('Erro no sistema de pontuação em equipe. O trigger de replicação falhou. Contacte o administrador do sistema.');
        }
        
        if (dbError.message?.includes('FROM-clause')) {
          throw new Error('Erro de configuração do servidor: problemas nos triggers SQL. A pontuação não foi salva devido a erro de configuração.');
        }
        
        if (dbError.message?.includes('corrompida')) {
          throw new Error('Configuração do banco de dados corrompida. A funcionalidade de pontuação requer correção pelo administrador.');
        }
        
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
      
      // Show specific error messages for trigger and database issues
      if (errorMessage.includes('FROM-clause') || errorMessage.includes('missing FROM-clause entry')) {
        toast.error('Erro crítico no sistema: trigger de banco de dados corrompido. Contacte o administrador sobre o erro SQL "missing FROM-clause".');
      } else if (errorMessage.includes('trigger') || errorMessage.includes('replicação')) {
        toast.error('Erro no sistema de replicação de pontuações. A configuração do servidor precisa ser corrigida pelo administrador.');
      } else if (errorMessage.includes('corrompida') || errorMessage.includes('configuração')) {
        toast.error('Configuração do banco de dados corrompida. Contacte o administrador do sistema.');
      } else {
        toast.error(`Erro ao registrar pontuação: ${errorMessage}`);
      }
    }
  });

  return { submitScoreMutation };
}
