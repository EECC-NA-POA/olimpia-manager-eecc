import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Modality, RuleForm } from '../types';

export function useModalityRulesMutations() {
  const [isSaving, setIsSaving] = useState(false);

  const createBaterias = async (modalityId: string, eventId: string, numBaterias: number) => {
    console.log(`Creating ${numBaterias} baterias for modality ${modalityId} in event ${eventId}`);
    
    try {
      // First, let's check the current user's permissions
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting current user:', userError);
        throw new Error('Erro ao verificar usuário atual');
      }
      
      console.log('Current user ID:', user?.id);
      
      // Check user permissions more thoroughly
      const { data: userPermissions, error: permError } = await supabase
        .from('papeis_usuarios')
        .select(`
          perfis!inner(
            nome,
            perfil_tipo_id,
            perfis_tipo!inner(
              codigo,
              descricao
            )
          )
        `)
        .eq('usuario_id', user?.id)
        .eq('evento_id', eventId);
      
      if (permError) {
        console.error('Error checking permissions:', permError);
      } else {
        console.log('User permissions detailed:', userPermissions);
        
        // Log each permission for debugging
        userPermissions?.forEach((perm, index) => {
          console.log(`Permission ${index + 1}:`, {
            nome: perm.perfis.nome,
            perfil_tipo_id: perm.perfis.perfil_tipo_id,
            codigo: perm.perfis.perfis_tipo.codigo,
            descricao: perm.perfis.perfis_tipo.descricao
          });
        });
      }
      
      // Verify admin permission exists
      const hasAdminPermission = userPermissions?.some(perm => 
        perm.perfis.perfis_tipo.codigo === 'ADM'
      );
      
      console.log('Has admin permission:', hasAdminPermission);
      
      if (!hasAdminPermission) {
        throw new Error('Você não tem permissão para criar baterias. Verifique suas permissões.');
      }
      
      // First, delete existing baterias for this modality to avoid duplicates
      console.log('Deleting existing baterias...');
      const { error: deleteError } = await supabase
        .from('baterias')
        .delete()
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId);
      
      if (deleteError) {
        console.error('Error deleting existing baterias:', deleteError);
        // Don't throw here, continue with creation
      }
      
      // Try using RPC function instead of direct insert
      console.log('Attempting to create baterias using RPC...');
      
      const { data: rpcResult, error: rpcError } = await supabase.rpc('criar_baterias_modalidade', {
        p_modalidade_id: parseInt(modalityId),
        p_evento_id: eventId,
        p_num_baterias: numBaterias
      });
      
      if (rpcError) {
        console.error('RPC function error:', rpcError);
        console.log('Falling back to direct insert...');
        
        // Fallback to direct insert
        const bateriasToInsert = Array.from({ length: numBaterias }, (_, index) => ({
          evento_id: eventId,
          modalidade_id: parseInt(modalityId),
          numero: index + 1,
          descricao: `Bateria ${index + 1}`
        }));
        
        console.log('Attempting to insert baterias directly:', bateriasToInsert);
        console.log('Bateria table structure check - modalidade_id type:', typeof bateriasToInsert[0].modalidade_id);
        console.log('Bateria table structure check - evento_id type:', typeof bateriasToInsert[0].evento_id);
        
        const { data, error } = await supabase
          .from('baterias')
          .insert(bateriasToInsert)
          .select();
        
        if (error) {
          console.error('Detailed error creating baterias:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          
          if (error.code === '42501') {
            throw new Error('Política RLS bloqueando inserção. Verifique as políticas da tabela baterias.');
          }
          
          if (error.code === '23503') {
            throw new Error('Erro de referência: modalidade ou evento não encontrado.');
          }
          
          if (error.code === '23505') {
            throw new Error('Bateria duplicada encontrada.');
          }
          
          throw new Error(`Erro ao criar baterias: ${error.message}`);
        }
        
        console.log(`Successfully created ${numBaterias} baterias via direct insert:`, data);
        return data;
      } else {
        console.log(`Successfully created ${numBaterias} baterias via RPC:`, rpcResult);
        return rpcResult;
      }
    } catch (error) {
      console.error('Error in createBaterias:', error);
      throw error;
    }
  };

  const saveRule = async (
    modalityId: string,
    ruleForm: RuleForm,
    modalities: Modality[],
    setModalities: (modalities: Modality[]) => void
  ) => {
    setIsSaving(true);
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
      
      // Check if we need to create baterias
      if (ruleForm.parametros.baterias && ruleForm.parametros.num_baterias) {
        const modalityData = modalities.find(m => m.id === modalityId);
        if (modalityData?.evento_id) {
          console.log('Creating baterias because rule has baterias=true and num_baterias:', ruleForm.parametros.num_baterias);
          
          try {
            await createBaterias(
              modalityId, 
              modalityData.evento_id, 
              ruleForm.parametros.num_baterias
            );
            console.log(`Successfully created ${ruleForm.parametros.num_baterias} baterias for modality ${modalityId}`);
          } catch (bateriaError) {
            console.error('Failed to create baterias, but rule was saved:', bateriaError);
            // Show a more detailed error message
            const errorMessage = bateriaError instanceof Error ? bateriaError.message : 'Erro desconhecido ao criar baterias';
            toast.error(`Regra salva, mas não foi possível criar as baterias: ${errorMessage}`);
          }
        } else {
          console.warn('No evento_id found for modality, cannot create baterias');
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
        const { error: bateriaError } = await supabase
          .from('baterias')
          .delete()
          .eq('modalidade_id', modalityId)
          .eq('evento_id', modalityData.evento_id);
          
        if (bateriaError) {
          console.error('Error deleting baterias:', bateriaError);
          // Continue with rule deletion even if bateria deletion fails
        }
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
