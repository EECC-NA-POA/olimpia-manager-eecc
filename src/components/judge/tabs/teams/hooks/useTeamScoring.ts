
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDynamicScoringSubmission } from '@/hooks/useDynamicScoringSubmission';
import { toast } from 'sonner';

interface UseTeamScoringProps {
  eventId: string | null;
  judgeId: string;
}

export function useTeamScoring({ eventId, judgeId }: UseTeamScoringProps) {
  const queryClient = useQueryClient();
  const dynamicScoringMutation = useDynamicScoringSubmission();

  const submitTeamScore = useMutation({
    mutationFn: async ({
      teamId,
      modalityId,
      modeloId,
      athleteId,
      formData
    }: {
      teamId: number;
      modalityId: number;
      modeloId: number;
      athleteId: string;
      formData: any;
    }) => {
      console.log('=== TEAM SCORING SUBMISSION (CLEAN) ===');
      console.log('Team ID:', teamId);
      console.log('Modality ID:', modalityId);
      console.log('Modelo ID:', modeloId);
      console.log('Athlete ID:', athleteId);
      console.log('Form Data:', formData);

      if (!eventId) {
        throw new Error('Event ID is required');
      }

      // Clean submission data - NO battery references for team modalities
      const submissionData = {
        athleteId,
        modalityId,
        eventId,
        judgeId,
        modeloId,
        equipeId: teamId,
        formData: {
          ...formData,
          notes: formData.notes || ''
        },
        observacoes: formData.notes || null
      };

      console.log('Clean submission data (NO BATTERIES):', submissionData);

      return await dynamicScoringMutation.mutateAsync(submissionData);
    },
    onSuccess: (data, variables) => {
      console.log('=== TEAM SCORE SUBMISSION SUCCESS ===');
      toast.success('Pontuação registrada para todos os membros da equipe!');
      
      // Invalidate team scoring queries
      queryClient.invalidateQueries({ 
        queryKey: ['team-scoring-data'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['team-score'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['clean-team-score'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['dynamic-scores'] 
      });
    },
    onError: (error: any) => {
      console.error('=== TEAM SCORING ERROR ===');
      console.error('Team scoring error:', error);
      
      let errorMessage = 'Erro ao registrar pontuação da equipe';
      
      if (error?.message?.includes('bateria')) {
        errorMessage = 'ERRO: Sistema tentando usar baterias em modalidade sem baterias';
      } else if (error?.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      toast.error(errorMessage);
      throw error; // Re-throw para que o componente possa lidar com o erro
    }
  });

  return {
    submitTeamScore: submitTeamScore.mutateAsync,
    isSubmitting: submitTeamScore.isPending
  };
}
