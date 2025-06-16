
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
    console.log('Numero Bateria:', numeroBateria);

    try {
      // Preparar dados de submissão - GARANTIDO SEM CAMPOS DE BATERIA para modalidades sem baterias
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

      // CRITICAL: Only add numeroBateria if it exists and is not null/undefined
      if (numeroBateria !== null && numeroBateria !== undefined) {
        submissionData.numeroBateria = numeroBateria;
      }

      console.log('Final submission data (GUARANTEED NO BATTERY FIELDS FOR NON-BATTERY MODALITIES):', submissionData);

      await mutation.mutateAsync(submissionData);

      console.log('=== SUBMISSÃO CONCLUÍDA COM SUCESSO (SEM BATERIAS) ===');
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
