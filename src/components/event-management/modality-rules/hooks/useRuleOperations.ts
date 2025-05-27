
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Modality, RuleForm, ModalityRule } from '../types';
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
            parametros: ruleForm.parametros,
            atualizado_em: new Date().toISOString()
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
      
      // Check if we need to create baterias - based on the baterias parameter
      const needsBaterias = ruleForm.parametros.baterias === true;
      
      let numBaterias = 0;
      
      if (needsBaterias) {
        // Determine number of baterias to create
        if (ruleForm.parametros.num_baterias) {
          numBaterias = ruleForm.parametros.num_baterias;
        } else if (ruleForm.parametros.num_tentativas) {
          numBaterias = ruleForm.parametros.num_tentativas;
        } else {
          // Default to 3 baterias
          numBaterias = 3;
        }
      }
      
      console.log('Needs baterias:', needsBaterias, 'Num baterias:', numBaterias);
      
      if (needsBaterias && numBaterias > 0) {
        const modalityData = modalities.find(m => m.id === modalityId);
        if (modalityData?.evento_id) {
          console.log('Creating baterias because rule needs them. Num baterias:', numBaterias);
          
          try {
            // Always try to create baterias for this rule type
            await createBaterias(
              modalityId, 
              modalityData.evento_id, 
              numBaterias
            );
            console.log(`Successfully created ${numBaterias} baterias for modality ${modalityId}`);
            toast.success(`Regra salva com sucesso! ${numBaterias} bateria(s) criada(s).`);
          } catch (bateriaError) {
            console.error('Failed to create baterias, but rule was saved:', bateriaError);
            // Show a more detailed error message but don't fail the rule save
            const errorMessage = bateriaError instanceof Error ? bateriaError.message : 'Erro desconhecido ao criar baterias';
            toast.warning(`Regra salva, mas houve problema ao criar baterias: ${errorMessage}. Tente recriar as baterias manualmente.`);
          }
        } else {
          console.warn('No evento_id found for modality, cannot create baterias');
          toast.warning('Regra salva, mas não foi possível criar baterias: evento não encontrado.');
        }
      } else if (!needsBaterias) {
        // If baterias is false, delete existing baterias
        const modalityData = modalities.find(m => m.id === modalityId);
        if (modalityData?.evento_id) {
          console.log('Deleting existing baterias because rule does not need them');
          try {
            await deleteBaterias(modalityId, modalityData.evento_id);
          } catch (deleteError) {
            console.error('Failed to delete baterias:', deleteError);
          }
        }
      } else {
        toast.success('Regra salva com sucesso!');
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
      
    } catch (error) {
      console.error('Error saving rule:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar regra';
      toast.error(`Erro ao salvar regra: ${errorMessage}`);
      throw error;
    }
  };

  // Add a helper function to manually create baterias for existing rules
  const ensureBateriasForRule = async (
    modalityId: string,
    eventId: string,
    rule: ModalityRule
  ) => {
    console.log('Ensuring baterias exist for modality:', modalityId);
    
    const needsBaterias = rule.parametros?.baterias === true;
    
    if (!needsBaterias) {
      console.log('Rule does not need baterias');
      return;
    }
    
    // Check if baterias already exist
    const { data: existingBaterias, error: checkError } = await supabase
      .from('baterias')
      .select('id')
      .eq('modalidade_id', modalityId)
      .eq('evento_id', eventId);
    
    if (checkError) {
      console.error('Error checking existing baterias:', checkError);
      throw checkError;
    }
    
    if (existingBaterias && existingBaterias.length > 0) {
      console.log(`Baterias already exist (${existingBaterias.length}) for modality ${modalityId}`);
      return;
    }
    
    // Create baterias
    let numBaterias = 3; // Default
    if (rule.parametros?.num_baterias) {
      numBaterias = rule.parametros.num_baterias;
    } else if (rule.parametros?.num_tentativas) {
      numBaterias = rule.parametros.num_tentativas;
    }
    
    console.log(`Creating ${numBaterias} baterias for existing rule`);
    await createBaterias(modalityId, eventId, numBaterias);
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
    deleteRule,
    ensureBateriasForRule
  };
}
