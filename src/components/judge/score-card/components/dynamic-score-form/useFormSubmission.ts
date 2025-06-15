
import { useDynamicScoringSubmission } from '@/hooks/useDynamicScoringSubmission';

interface UseFormSubmissionProps {
  eventId: string;
  modalityId: number;
  athleteId: string;
  equipeId?: number;
  judgeId: string;
  modeloId: number;
  numeroBateria?: number; // Changed from bateriaId to numeroBateria
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
  numeroBateria, // Changed from bateriaId to numeroBateria
  raia,
  onSuccess
}: UseFormSubmissionProps) {
  const mutation = useDynamicScoringSubmission();

  const handleSubmit = async (formData: any) => {
    console.log('=== SUBMISSÃO DO FORMULÁRIO (DynamicScoreForm) ===');
    console.log('Form data:', formData);
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
        bateriaId: numeroBateria, // Pass numeroBateria as bateriaId (will be converted to numero_bateria)
        observacoes: formData.notes
      });

      console.log('=== SUBMISSÃO CONCLUÍDA COM SUCESSO ===');
      onSuccess?.();
    } catch (error) {
      console.error('=== ERRO NA SUBMISSÃO DO FORMULÁRIO (DynamicScoreForm) ===');
      console.error('Error submitting dynamic score:', error);
      console.error('Error details:', error);
      throw error;
    }
  };

  return {
    handleSubmit,
    isSubmitting: mutation.isPending
  };
}
