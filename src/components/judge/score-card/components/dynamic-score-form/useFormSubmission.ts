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
    console.log('Notes field value:', data.notes);
    console.log('Full form data keys:', Object.keys(data));
    
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
    console.log('Notes extracted successfully:', notes);
    console.log('Notes type:', typeof notes);
    console.log('Notes length:', notes?.length || 'undefined/null');
    
    console.log('=== PARÂMETROS DE SUBMISSÃO (DynamicScoreForm) ===');
    const submissionParams = {
      athleteId,
      modalityId,
      eventId,
      judgeId,
      modeloId,
      formData,
      bateriaId,
      // Ensure observacoes is properly passed with the notes value
      observacoes: notes || null,
    };
    console.log('Submission params with observacoes:', submissionParams);
    console.log('Observacoes value being sent:', submissionParams.observacoes);
    
    try {
      console.log('=== CHAMANDO MUTAÇÃO (DynamicScoreForm) ===');
      console.log('About to call mutation with observacoes:', submissionParams.observacoes);
      await submissionMutation.mutateAsync(submissionParams);
      
      console.log('=== MUTAÇÃO EXECUTADA COM SUCESSO (DynamicScoreForm) ===');
      onSuccess?.();
    } catch (error) {
      console.error('=== ERRO NA SUBMISSÃO DO FORMULÁRIO (DynamicScoreForm) ===');
      console.error('Error submitting dynamic score:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  };

  return {
    handleSubmit,
    isSubmitting: submissionMutation.isPending
  };
}
