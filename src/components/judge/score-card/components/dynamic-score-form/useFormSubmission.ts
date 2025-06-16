
import { useDynamicScoringSubmission } from '@/hooks/useDynamicScoringSubmission';

interface UseFormSubmissionProps {
  eventId: string;
  modalityId: number;
  athleteId: string;
  equipeId?: number;
  judgeId: string;
  modeloId: number;
  numeroBateria?: number;
  raia?: number;
  onSuccess?: () => void;
}

export function useFormSubmission({
  eventId,
  modalityId,
  athleteId,
  equipeId,
  judgeId,
  modeloId,
  numeroBateria,
  raia,
  onSuccess
}: UseFormSubmissionProps) {
  const mutation = useDynamicScoringSubmission();

  const handleSubmit = async (formData: any) => {
    console.log('=== SUBMISSÃO DO FORMULÁRIO (DynamicScoreForm - EQUIPES) ===');
    console.log('Form data:', formData);
    console.log('Equipe ID:', equipeId);

    try {
      // Preparar dados de submissão - CLEAN OBJECT SEM CAMPOS DE BATERIA
      const submissionData: any = {
        athleteId,
        modalityId,
        eventId,
        judgeId,
        modeloId,
        equipeId,
        raia,
        formData,
        observacoes: formData.notes
      };

      console.log('Final submission data (NO BATTERY FIELDS):', submissionData);

      await mutation.mutateAsync(submissionData);

      console.log('=== SUBMISSÃO CONCLUÍDA COM SUCESSO ===');
      onSuccess?.();
    } catch (error) {
      console.error('=== ERRO NA SUBMISSÃO DO FORMULÁRIO ===');
      console.error('Error submitting score:', error);
      throw error;
    }
  };

  return {
    handleSubmit,
    isSubmitting: mutation.isPending
  };
}
