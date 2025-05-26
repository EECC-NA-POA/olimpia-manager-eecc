
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Modality, RuleForm } from '../types';

export function useModalityRulesMutations() {
  const [isSaving, setIsSaving] = useState(false);

  const createBaterias = async (modalityId: string, eventId: string, numBaterias: number) => {
    console.log(`Creating ${numBaterias} baterias for modality ${modalityId} in event ${eventId}`);
    
    // First, delete existing baterias for this modality to avoid duplicates
    await supabase
      .from('baterias')
      .delete()
      .eq('modalidade_id', modalityId)
      .eq('evento_id', eventId);
    
    // Create new baterias
    const bateriasToInsert = Array.from({ length: numBaterias }, (_, index) => ({
      evento_id: eventId,
      modalidade_id: parseInt(modalityId),
      numero: index + 1,
      descricao: `Bateria ${index + 1}`
    }));
    
    const { error } = await supabase
      .from('baterias')
      .insert(bateriasToInsert);
    
    if (error) {
      console.error('Error creating baterias:', error);
      throw error;
    }
    
    console.log(`Successfully created ${numBaterias} baterias`);
  };

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
      
      // Check if we need to create baterias
      if (ruleForm.parametros.baterias && ruleForm.parametros.num_baterias) {
        const modalityData = modalities.find(m => m.id === modalityId);
        if (modalityData?.evento_id) {
          await createBaterias(
            modalityId, 
            modalityData.evento_id, 
            ruleForm.parametros.num_baterias
          );
          console.log(`Created ${ruleForm.parametros.num_baterias} baterias for modality ${modalityId}`);
        }
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
      // Delete associated baterias first
      const modalityData = modalities.find(m => m.id === modalityId);
      if (modalityData?.evento_id) {
        await supabase
          .from('baterias')
          .delete()
          .eq('modalidade_id', modalityId)
          .eq('evento_id', modalityData.evento_id);
      }
      
      // Then delete the rule
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
