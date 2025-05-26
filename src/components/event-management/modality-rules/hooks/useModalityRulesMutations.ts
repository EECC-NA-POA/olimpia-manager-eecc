
import { useState } from 'react';
import { useRuleOperations } from './useRuleOperations';

export function useModalityRulesMutations() {
  const [isSaving, setIsSaving] = useState(false);
  const { saveRule: saveRuleOperation, deleteRule: deleteRuleOperation } = useRuleOperations();

  const saveRule = async (
    modalityId: string,
    ruleForm: any,
    modalities: any[],
    setModalities: (modalities: any[]) => void
  ) => {
    setIsSaving(true);
    try {
      await saveRuleOperation(modalityId, ruleForm, modalities, setModalities);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRule = async (
    modalityId: string,
    modalities: any[],
    setModalities: (modalities: any[]) => void
  ) => {
    await deleteRuleOperation(modalityId, modalities, setModalities);
  };

  return {
    isSaving,
    saveRule,
    deleteRule,
  };
}
