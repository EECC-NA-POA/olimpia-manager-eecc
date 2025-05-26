
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ScheduleForm } from '../types';

export const useScheduleOperations = (
  eventId: string | null,
  refreshSchedule: () => void
) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (currentItem: ScheduleForm, editingId: string | null) => {
    if (!eventId) return;
    
    // Basic validation
    if (!currentItem.titulo || !currentItem.data) {
      toast.error('Preencha pelo menos o título e a data');
      return;
    }
    
    setIsSaving(true);
    try {
      if (editingId) {
        // Update existing item
        const { error } = await supabase
          .from('cronogramas')
          .update({
            titulo: currentItem.titulo,
            descricao: currentItem.descricao,
            local: currentItem.local,
            data: currentItem.data,
            hora_inicio: currentItem.hora_inicio,
            hora_fim: currentItem.hora_fim,
            tipo: currentItem.tipo
          })
          .eq('id', editingId);
        
        if (error) throw error;
        
        toast.success('Item de cronograma atualizado com sucesso!');
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('cronogramas')
          .insert({
            evento_id: eventId,
            titulo: currentItem.titulo,
            descricao: currentItem.descricao,
            local: currentItem.local,
            data: currentItem.data,
            hora_inicio: currentItem.hora_inicio,
            hora_fim: currentItem.hora_fim,
            tipo: currentItem.tipo
          })
          .select();
        
        if (error) throw error;
        
        toast.success('Item de cronograma adicionado com sucesso!');
      }
      
      // Refresh the list
      refreshSchedule();
      
      return true; // Success
    } catch (error) {
      console.error('Error saving schedule item:', error);
      toast.error('Erro ao salvar item de cronograma');
      return false; // Failure
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item do cronograma?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('cronogramas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Item de cronograma excluído com sucesso!');
      
      // Refresh the list
      refreshSchedule();
    } catch (error) {
      console.error('Error deleting schedule item:', error);
      toast.error('Erro ao excluir item de cronograma');
    }
  };

  return {
    isSaving,
    handleSave,
    handleDelete
  };
};
