
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Modality, ModalityForm } from '../types';

export function useModalityMutations(eventId: string | null) {
  const [isSaving, setIsSaving] = useState(false);

  const saveModality = async (
    modalityData: ModalityForm,
    editingId: string | null,
    onSuccess: (modality: Modality) => void
  ) => {
    if (!eventId) return false;
    
    // Basic validation
    if (!modalityData.nome) {
      toast.error('O nome da modalidade é obrigatório');
      return false;
    }
    
    setIsSaving(true);
    try {
      if (editingId) {
        // Update existing item using RPC function
        const { data, error } = await supabase
          .rpc('atualizar_modalidade', {
            modalidade_id: parseInt(editingId),
            nome_modalidade: modalityData.nome,
            tipo_pontuacao_modalidade: modalityData.tipo_pontuacao,
            tipo_modalidade_modalidade: modalityData.tipo_modalidade,
            categoria_modalidade: modalityData.categoria,
            status_modalidade: modalityData.status,
            limite_vagas_modalidade: modalityData.limite_vagas,
            grupo_modalidade: modalityData.grupo,
            faixa_etaria_modalidade: modalityData.faixa_etaria
          });
        
        if (error) {
          console.error('RPC update error:', error);
          // Fallback to direct update if RPC doesn't exist
          const { error: directError } = await supabase
            .from('modalidades')
            .update({
              nome: modalityData.nome,
              tipo_pontuacao: modalityData.tipo_pontuacao,
              tipo_modalidade: modalityData.tipo_modalidade,
              categoria: modalityData.categoria,
              status: modalityData.status,
              limite_vagas: modalityData.limite_vagas,
              grupo: modalityData.grupo,
              faixa_etaria: modalityData.faixa_etaria
            })
            .eq('id', editingId);
          
          if (directError) throw directError;
        }
        
        onSuccess({ 
          id: editingId, 
          evento_id: eventId, 
          vagas_ocupadas: 0,
          ...modalityData 
        } as Modality);
        toast.success('Modalidade atualizada com sucesso!');
      } else {
        // Create new item using RPC function
        const { data, error } = await supabase
          .rpc('criar_modalidade', {
            evento_id_param: eventId,
            nome_modalidade: modalityData.nome,
            tipo_pontuacao_modalidade: modalityData.tipo_pontuacao,
            tipo_modalidade_modalidade: modalityData.tipo_modalidade,
            categoria_modalidade: modalityData.categoria,
            status_modalidade: modalityData.status,
            limite_vagas_modalidade: modalityData.limite_vagas,
            grupo_modalidade: modalityData.grupo,
            faixa_etaria_modalidade: modalityData.faixa_etaria
          });
        
        if (error) {
          console.error('RPC create error:', error);
          // Fallback to direct insert if RPC doesn't exist
          const { data: insertData, error: directError } = await supabase
            .from('modalidades')
            .insert({
              evento_id: eventId,
              nome: modalityData.nome,
              tipo_pontuacao: modalityData.tipo_pontuacao,
              tipo_modalidade: modalityData.tipo_modalidade,
              categoria: modalityData.categoria,
              status: modalityData.status,
              limite_vagas: modalityData.limite_vagas,
              vagas_ocupadas: 0,
              grupo: modalityData.grupo,
              faixa_etaria: modalityData.faixa_etaria
            })
            .select();
          
          if (directError) throw directError;
          
          if (insertData && insertData.length > 0) {
            onSuccess(insertData[0] as Modality);
          }
        } else if (data) {
          // RPC returned data successfully
          onSuccess(data as Modality);
        }
        
        toast.success('Modalidade adicionada com sucesso!');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving modality:', error);
      toast.error('Erro ao salvar modalidade');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteModality = async (id: string, onSuccess: () => void) => {
    if (!confirm('Tem certeza que deseja excluir esta modalidade?')) {
      return;
    }
    
    try {
      // Try RPC function first
      const { error: rpcError } = await supabase
        .rpc('excluir_modalidade', {
          modalidade_id: parseInt(id)
        });
      
      if (rpcError) {
        console.error('RPC delete error:', rpcError);
        // Fallback to direct delete
        const { error: directError } = await supabase
          .from('modalidades')
          .delete()
          .eq('id', id);
        
        if (directError) throw directError;
      }
      
      onSuccess();
      toast.success('Modalidade excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting modality:', error);
      toast.error('Erro ao excluir modalidade');
    }
  };

  return {
    isSaving,
    saveModality,
    deleteModality
  };
}
