
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
    console.log('Número da bateria (numeroBateria):', numeroBateria);

    try {
      await mutation.mutateAsync({
        athleteId,
        modalityId,
        eventId,
        judgeId,
        modeloId,
        equipeId,
        raia,
        formData,
        bateriaId: numeroBateria, // Will be converted to numero_bateria internally if needed
        observacoes: formData.notes
      });

      console.log('=== SUBMISSÃO DE EQUIPE CONCLUÍDA COM SUCESSO ===');
      onSuccess?.();
    } catch (error) {
      console.error('=== ERRO NA SUBMISSÃO DO FORMULÁRIO (DynamicScoreForm - EQUIPES) ===');
      console.error('Error submitting team score:', error);
      throw error;
    }
  };

  return {
    handleSubmit,
    isSubmitting: mutation.isPending
  };
}
