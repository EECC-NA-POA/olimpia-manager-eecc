
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Modality, RuleForm } from '../types';
import { useBatteryOperations } from './useBatteryOperations';

export function useRuleOperations() {
  const { createBaterias, deleteBaterias } = useBatteryOperations();

  const saveRule = async (
    modalityId: string,
    ruleForm: RuleForm,
    modalities: Modality[],
    setModalities: (modalities: Modality[]) => void
  ) => {
    console.log('Saving rule for modality:', modalityId, 'with form:', ruleForm);
    
    try {
      const modality = modalities.find(m => m.id === modalityId);
      console.log('Found modality:', modality);
      
      if (modality?.regra) {
        // Update existing rule
        console.log('Updating existing rule');
        const { error } = await supabase
          .from('modalidade_regras')
          .update({
            regra_tipo: ruleForm.regra_tipo,
            parametros: ruleForm.parametros
          })
          .eq('modalidade_id', modalityId);
        
        if (error) {
          console.error('Error updating rule:', error);
          throw error;
        }
      } else {
        // Create new rule
        console.log('Creating new rule');
        const { error } = await supabase
          .from('modalidade_regras')
          .insert({
            modalidade_id: modalityId,
            regra_tipo: ruleForm.regra_tipo,
            parametros: ruleForm.parametros
          });
        
        if (error) {
          console.error('Error creating rule:', error);
          throw error;
        }
      }
      
      // Check if we need to create baterias for any rule type that uses them
      const needsBaterias = ruleForm.parametros.baterias === true;
      const numBaterias = ruleForm.parametros.num_baterias || 
                          ruleForm.parametros.num_tentativas || 
                          (ruleForm.regra_tipo === 'tempo' && needsBaterias ? 5 : 0); // Default heats for tempo modalities
      
      if (needsBaterias && numBaterias > 0) {
        const modalityData = modalities.find(m => m.id === modalityId);
        if (modalityData?.evento_id) {
          console.log('Creating baterias because rule has baterias=true. Num baterias:', numBaterias);
          
          try {
            await createBaterias(
              modalityId, 
              modalityData.evento_id, 
              numBaterias
            );
            console.log(`Successfully created ${numBaterias} baterias for modality ${modalityId}`);
          } catch (bateriaError) {
            console.error('Failed to create baterias, but rule was saved:', bateriaError);
            // Show a more detailed error message
            const errorMessage = bateriaError instanceof Error ? bateriaError.message : 'Erro desconhecido ao criar baterias';
            toast.error(`Regra salva, mas não foi possível criar as baterias: ${errorMessage}`);
          }
        } else {
          console.warn('No evento_id found for modality, cannot create baterias');
        }
      } else if (!needsBaterias) {
        // If baterias is false, delete existing baterias
        const modalityData = modalities.find(m => m.id === modalityId);
        if (modalityData?.evento_id) {
          console.log('Deleting existing baterias because rule has baterias=false');
          try {
            await deleteBaterias(modalityId, modalityData.evento_id);
          } catch (deleteError) {
            console.error('Failed to delete baterias:', deleteError);
          }
        }
      }
      
      // Refresh the data
      const { data: updatedRule, error: fetchError } = await supabase
        .from('modalidade_regras')
        .select('*')
        .eq('modalidade_id', modalityId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching updated rule:', fetchError);
      }
      
      setModalities(modalities.map(m => 
        m.id === modalityId 
          ? { ...m, regra: updatedRule || undefined }
          : m
      ));
      
      toast.success('Regra salva com sucesso!');
    } catch (error) {
      console.error('Error saving rule:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar regra';
      toast.error(`Erro ao salvar regra: ${errorMessage}`);
      throw error;
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
        await deleteBaterias(modalityId, modalityData.evento_id);
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
    saveRule,
    deleteRule
  };
}
