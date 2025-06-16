
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
    console.log('=== SUBMISSÃO DO FORMULÁRIO (DynamicScoreForm - EQUIPES SEM BATERIAS) ===');
    console.log('Form data:', formData);
    console.log('Equipe ID:', equipeId);

    try {
      // Preparar dados de submissão - NUNCA incluir qualquer referência a bateria
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

      // NUNCA incluir qualquer campo relacionado a bateria
      console.log('Final submission data (NO BATERIA):', submissionData);

      await mutation.mutateAsync(submissionData);

      console.log('=== SUBMISSÃO DE EQUIPE CONCLUÍDA COM SUCESSO (SEM BATERIAS) ===');
      onSuccess?.();
    } catch (error) {
      console.error('=== ERRO NA SUBMISSÃO DO FORMULÁRIO (DynamicScoreForm - EQUIPES SEM BATERIAS) ===');
      console.error('Error submitting team score:', error);
      throw error;
    }
  };

  return {
    handleSubmit,
    isSubmitting: mutation.isPending
  };
}
