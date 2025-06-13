
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useDynamicScoringSubmission } from '@/hooks/useDynamicScoringSubmission';
import { Athlete } from '../hooks/useAthletes';
import { CampoModelo, ModeloModalidade } from '@/types/dynamicScoring';

interface UseDynamicScoringTableOperationsProps {
  modalityId: number;
  eventId: string;
  judgeId: string;
  modelo: ModeloModalidade;
  selectedBateriaId?: number | null;
  campos: CampoModelo[];
  existingScores: any[];
  editValues: Record<string, any>;
  refetchScores: () => Promise<any>;
  stopEditing: (athleteId: string) => void;
  clearUnsavedChanges: (athleteId: string) => void;
}

export function useDynamicScoringTableOperations({
  modalityId,
  eventId,
  judgeId,
  modelo,
  selectedBateriaId,
  campos,
  existingScores,
  editValues,
  refetchScores,
  stopEditing,
  clearUnsavedChanges
}: UseDynamicScoringTableOperationsProps) {
  const mutation = useDynamicScoringSubmission();

  const handleEdit = (athleteId: string, startEditing: (athleteId: string, existingScore: any, campos: CampoModelo[]) => void) => {
    console.log('=== STARTING EDIT ===');
    console.log('Athlete ID:', athleteId);
    const existingScore = existingScores.find(s => s.atleta_id === athleteId);
    console.log('Existing score for athlete:', existingScore);
    
    // Initialize edit values with valor_formatado for display
    const initialValues: Record<string, any> = {};
    if (existingScore?.tentativas) {
      Object.keys(existingScore.tentativas).forEach(fieldKey => {
        const tentativa = existingScore.tentativas[fieldKey];
        initialValues[fieldKey] = tentativa.valor_formatado || tentativa.valor || '';
      });
    }
    
    // Add bateria field if selectedBateriaId exists and not in existing values
    if (selectedBateriaId && !initialValues.bateria && !initialValues.numero_bateria) {
      const bateriaField = campos.find(c => c.chave_campo === 'bateria' || c.chave_campo === 'numero_bateria');
      if (bateriaField) {
        initialValues[bateriaField.chave_campo] = selectedBateriaId === 999 ? 'Final' : selectedBateriaId.toString();
      }
    }
    
    console.log('Initial edit values:', initialValues);
    startEditing(athleteId, { tentativas: initialValues }, campos);
  };

  const handleSave = async (athleteId: string) => {
    const athleteEditValues = editValues[athleteId];
    if (!athleteEditValues) {
      console.error('No edit values found for athlete:', athleteId);
      toast.error('Erro: dados de edição não encontrados');
      return;
    }

    console.log('=== SAVING SCORE ===');
    console.log('Athlete ID:', athleteId);
    console.log('Values to save:', athleteEditValues);

    try {
      // Prepare form data ensuring all required fields are included
      const formData = { ...athleteEditValues };
      
      // Add bateria field if not present but selectedBateriaId exists
      if (selectedBateriaId && !formData.bateria && !formData.numero_bateria) {
        const bateriaField = campos.find(c => c.chave_campo === 'bateria' || c.chave_campo === 'numero_bateria');
        if (bateriaField) {
          formData[bateriaField.chave_campo] = selectedBateriaId === 999 ? 'Final' : selectedBateriaId;
        }
      }

      console.log('Final form data for submission:', formData);

      await mutation.mutateAsync({
        athleteId,
        modalityId,
        eventId,
        judgeId,
        modeloId: modelo.id,
        formData,
        bateriaId: selectedBateriaId
      });

      stopEditing(athleteId);
      clearUnsavedChanges(athleteId);
      await refetchScores();
      toast.success('Pontuação salva com sucesso!');
    } catch (error) {
      console.error('Error saving score:', error);
      toast.error('Erro ao salvar pontuação: ' + (error as Error).message);
    }
  };

  const handleCancel = (athleteId: string) => {
    stopEditing(athleteId);
    clearUnsavedChanges(athleteId);
  };

  return {
    handleEdit,
    handleSave,
    handleCancel,
    isSaving: mutation.isPending
  };
}
