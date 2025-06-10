
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ScheduleForm } from '../types';

export const useScheduleOperations = (
  eventId: string | null,
  refreshSchedule: () => void
) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (currentItem: ScheduleForm, editingId: number | null): Promise<boolean> => {
    if (!eventId) {
      toast.error('ID do evento não encontrado');
      return false;
    }
    
    // Basic validation
    if (!currentItem.atividade || !currentItem.dia) {
      toast.error('Preencha pelo menos a atividade e o dia');
      return false;
    }
    
    setIsSaving(true);
    try {
      if (editingId) {
        // Update existing activity
        const { error } = await supabase
          .from('cronograma_atividades')
          .update({
            atividade: currentItem.atividade,
            dia: currentItem.dia,
            horario_inicio: currentItem.horario_inicio,
            horario_fim: currentItem.horario_fim,
            local: currentItem.local,
            global: currentItem.global
          })
          .eq('id', editingId);
        
        if (error) throw error;
        
        // Update modalities if any
        if (currentItem.modalidades.length > 0) {
          // Delete existing modality associations
          await supabase
            .from('cronograma_atividade_modalidades')
            .delete()
            .eq('cronograma_atividade_id', editingId);
          
          // Insert new modality associations
          const modalityInserts = currentItem.modalidades.map(modalidadeId => ({
            cronograma_atividade_id: editingId,
            modalidade_id: modalidadeId
          }));
          
          const { error: modalityError } = await supabase
            .from('cronograma_atividade_modalidades')
            .insert(modalityInserts);
          
          if (modalityError) throw modalityError;
        }
        
        toast.success('Atividade do cronograma atualizada com sucesso!');
      } else {
        // Create new activity
        let cronogramaId = currentItem.cronograma_id;
        
        if (!cronogramaId) {
          // First, check if there's already a cronograma for this event
          const { data: existingCronograma } = await supabase
            .from('cronogramas')
            .select('id')
            .eq('evento_id', eventId)
            .limit(1)
            .single();
          
          if (existingCronograma) {
            cronogramaId = existingCronograma.id;
          } else {
            // Create a default cronograma for this event
            const { data: cronogramaData, error: cronogramaError } = await supabase
              .from('cronogramas')
              .insert({
                nome: 'Cronograma Principal',
                evento_id: eventId
              })
              .select()
              .single();
            
            if (cronogramaError) throw cronogramaError;
            cronogramaId = cronogramaData.id;
          }
        }
        
        const { data: activityData, error } = await supabase
          .from('cronograma_atividades')
          .insert({
            cronograma_id: cronogramaId,
            evento_id: eventId,
            atividade: currentItem.atividade,
            dia: currentItem.dia,
            horario_inicio: currentItem.horario_inicio,
            horario_fim: currentItem.horario_fim,
            local: currentItem.local,
            global: currentItem.global
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Insert modality associations if any
        if (currentItem.modalidades.length > 0) {
          const modalityInserts = currentItem.modalidades.map(modalidadeId => ({
            cronograma_atividade_id: activityData.id,
            modalidade_id: modalidadeId
          }));
          
          const { error: modalityError } = await supabase
            .from('cronograma_atividade_modalidades')
            .insert(modalityInserts);
          
          if (modalityError) throw modalityError;
        }
        
        toast.success('Atividade do cronograma adicionada com sucesso!');
      }
      
      // Refresh the list
      refreshSchedule();
      
      return true; // Success
    } catch (error) {
      console.error('Error saving schedule activity:', error);
      toast.error('Erro ao salvar atividade do cronograma');
      return false; // Failure
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta atividade do cronograma?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('cronograma_atividades')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Atividade do cronograma excluída com sucesso!');
      
      // Refresh the list
      refreshSchedule();
    } catch (error) {
      console.error('Error deleting schedule activity:', error);
      toast.error('Erro ao excluir atividade do cronograma');
    }
  };

  return {
    isSaving,
    handleSave,
    handleDelete
  };
};
