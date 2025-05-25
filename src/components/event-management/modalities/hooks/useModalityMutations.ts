
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Modality } from './useModalitiesData';

export interface ModalityForm {
  nome: string;
  descricao: string;
  vagas: number;
  is_ativo: boolean;
  genero: string;
  faixa_etaria_min: number;
  faixa_etaria_max: number | null;
  tipo: string;
}

export function useModalityMutations(eventId: string | null) {
  const [isSaving, setIsSaving] = useState(false);

  const saveModality = async (
    modalityData: ModalityForm,
    editingId: string | null,
    onSuccess: (modality: Modality) => void
  ) => {
    if (!eventId) return;
    
    // Basic validation
    if (!modalityData.nome) {
      toast.error('O nome da modalidade é obrigatório');
      return;
    }
    
    setIsSaving(true);
    try {
      if (editingId) {
        // Update existing item
        const { error } = await supabase
          .from('modalidades')
          .update({
            nome: modalityData.nome,
            descricao: modalityData.descricao,
            vagas: modalityData.vagas,
            is_ativo: modalityData.is_ativo,
            genero: modalityData.genero,
            faixa_etaria_min: modalityData.faixa_etaria_min,
            faixa_etaria_max: modalityData.faixa_etaria_max,
            tipo: modalityData.tipo
          })
          .eq('id', editingId);
        
        if (error) throw error;
        
        onSuccess({ id: editingId, evento_id: eventId, ...modalityData } as Modality);
        toast.success('Modalidade atualizada com sucesso!');
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('modalidades')
          .insert({
            evento_id: eventId,
            nome: modalityData.nome,
            descricao: modalityData.descricao,
            vagas: modalityData.vagas,
            is_ativo: modalityData.is_ativo,
            genero: modalityData.genero,
            faixa_etaria_min: modalityData.faixa_etaria_min,
            faixa_etaria_max: modalityData.faixa_etaria_max,
            tipo: modalityData.tipo
          })
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          onSuccess(data[0] as Modality);
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
      const { error } = await supabase
        .from('modalidades')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
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
