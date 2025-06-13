import { useDynamicScoringSubmission } from '@/hooks/useDynamicScoringSubmission';

interface UseFormSubmissionProps {
  eventId: string;
  modalityId: number;
  athleteId: string;
  equipeId?: number;
  judgeId: string;
  modeloId: number;
  bateriaId?: number;
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
  bateriaId,
  raia,
  onSuccess
}: UseFormSubmissionProps) {
  const submissionMutation = useDynamicScoringSubmission();

  const handleSubmit = async (data: any) => {
    console.log('=== FORMULÁRIO SUBMETIDO (DynamicScoreForm) ===');
    console.log('Form data submitted:', data);
    
    // Extract notes but keep everything else in formData
    const { notes, ...formDataFields } = data;
    
    // Ensure we include the raia in formData if it exists
    const formData = {
      ...formDataFields
    };

    // Add raia to formData if available
    if (raia !== undefined) {
      formData.raia = raia;
    }
    
    console.log('=== DADOS SEPARADOS (DynamicScoreForm) ===');
    console.log('Form data after separation:', { formData, notes });
    console.log('Notes will be mapped to observacoes:', notes);
    
    console.log('=== PARÂMETROS DE SUBMISSÃO (DynamicScoreForm) ===');
    const submissionParams = {
      athleteId,
      modalityId,
      eventId,
      judgeId,
      modeloId,
      formData,
      bateriaId,
      // Pass notes directly as observacoes to match the expected parameter name
      observacoes: notes || null,
    };
    console.log('Submission params:', submissionParams);
    
    try {
      console.log('=== CHAMANDO MUTAÇÃO (DynamicScoreForm) ===');
      await submissionMutation.mutateAsync(submissionParams);
      
      console.log('=== MUTAÇÃO EXECUTADA COM SUCESSO (DynamicScoreForm) ===');
      onSuccess?.();
    } catch (error) {
      console.error('=== ERRO NA SUBMISSÃO DO FORMULÁRIO (DynamicScoreForm) ===');
      console.error('Error submitting dynamic score:', error);
    }
  };

  return {
    handleSubmit,
    isSubmitting: submissionMutation.isPending
  };
}
