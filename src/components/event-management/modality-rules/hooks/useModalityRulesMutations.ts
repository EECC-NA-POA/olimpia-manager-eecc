
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Modality, RuleForm } from '../types';

export function useModalityRulesMutations() {
  const [isSaving, setIsSaving] = useState(false);

  const saveRule = async (
    modalityId: string,
    ruleForm: RuleForm,
    modalities: Modality[],
    setModalities: (modalities: Modality[]) => void
  ) => {
    setIsSaving(true);
    try {
      const modality = modalities.find(m => m.id === modalityId);
      
      if (modality?.regra) {
        // Update existing rule
        const { error } = await supabase
          .from('modalidade_regras')
          .update({
            regra_tipo: ruleForm.regra_tipo,
            parametros: ruleForm.parametros
          })
          .eq('modalidade_id', modalityId);
        
        if (error) throw error;
      } else {
        // Create new rule
        const { error } = await supabase
          .from('modalidade_regras')
          .insert({
            modalidade_id: modalityId,
            regra_tipo: ruleForm.regra_tipo,
            parametros: ruleForm.parametros
          });
        
        if (error) throw error;
      }
      
      // Refresh the data
      const { data: updatedRule } = await supabase
        .from('modalidade_regras')
        .select('*')
        .eq('modalidade_id', modalityId)
        .single();
      
      setModalities(modalities.map(m => 
        m.id === modalityId 
          ? { ...m, regra: updatedRule }
          : m
      ));
      
      toast.success('Regra salva com sucesso!');
    } catch (error) {
      console.error('Error saving rule:', error);
      toast.error('Erro ao salvar regra');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRule = async (
    modalityId: string,
    modalities: Modality[],
    setModalities: (modalities: Modality[]) => void
  ) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('modalidade_regras')
        .delete()
        .eq('modalidade_id', modalityId);
      
      if (error) throw error;
      
      setModalities(modalities.map(m => 
        m.id === modalityId 
          ? { ...m, regra: undefined }
          : m
      ));
      
      toast.success('Regra excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Erro ao excluir regra');
    }
  };

  return {
    isSaving,
    saveRule,
    deleteRule,
  };
}
