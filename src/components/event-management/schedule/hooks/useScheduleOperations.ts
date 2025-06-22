
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
    if (!currentItem.atividade) {
      toast.error('Preencha pelo menos o nome da atividade');
      return false;
    }

    // Validation for recurrent activities
    if (currentItem.recorrente) {
      if (currentItem.dias_semana.length === 0) {
        toast.error('Selecione pelo menos um dia da semana para atividades recorrentes');
        return false;
      }
      
      // Check if all selected days have schedules and locations
      for (const dia of currentItem.dias_semana) {
        const horario = currentItem.horarios_por_dia[dia];
        const local = currentItem.locais_por_dia[dia];
        
        if (!horario?.inicio || !horario?.fim) {
          toast.error(`Preencha os horários para ${dia}`);
          return false;
        }
        
        if (!local?.trim()) {
          toast.error(`Preencha o local para ${dia}`);
          return false;
        }
      }
    } else {
      // Validation for non-recurrent activities
      if (!currentItem.dia) {
        toast.error('Preencha a data da atividade');
        return false;
      }
    }
    
    setIsSaving(true);
    try {
      const baseData = {
        atividade: currentItem.atividade,
        global: currentItem.global,
        recorrente: currentItem.recorrente,
        dias_semana: currentItem.recorrente ? currentItem.dias_semana : null,
        horarios_por_dia: currentItem.recorrente ? currentItem.horarios_por_dia : null,
        locais_por_dia: currentItem.recorrente ? currentItem.locais_por_dia : null,
        data_fim_recorrencia: currentItem.recorrente && currentItem.data_fim_recorrencia ? currentItem.data_fim_recorrencia : null,
        // For non-recurrent activities
        dia: !currentItem.recorrente ? currentItem.dia : null,
        horario_inicio: !currentItem.recorrente ? currentItem.horario_inicio : null,
        horario_fim: !currentItem.recorrente ? currentItem.horario_fim : null,
        local: !currentItem.recorrente ? currentItem.local : null,
      };

      if (editingId) {
        // Update existing activity
        const { error } = await supabase
          .from('cronograma_atividades')
          .update(baseData)
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
          const { data: existingCronograma, error: fetchError } = await supabase
            .from('cronogramas')
            .select('id')
            .eq('evento_id', eventId)
            .limit(1)
            .maybeSingle();
          
          if (fetchError) {
            console.error('Error fetching existing cronograma:', fetchError);
            throw fetchError;
          }
          
          if (existingCronograma) {
            cronogramaId = existingCronograma.id;
          } else {
            // Create a default cronograma for this event using RPC function to bypass RLS
            const { data: cronogramaData, error: cronogramaError } = await supabase
              .rpc('create_cronograma_for_event', {
                p_evento_id: eventId,
                p_nome: 'Cronograma Principal'
              });
            
            if (cronogramaError) {
              console.error('Error creating cronograma via RPC:', cronogramaError);
              // Fallback: try direct insert
              const { data: fallbackData, error: fallbackError } = await supabase
                .from('cronogramas')
                .insert({
                  nome: 'Cronograma Principal',
                  evento_id: eventId
                })
                .select()
                .single();
              
              if (fallbackError) {
                console.error('Error creating cronograma via fallback:', fallbackError);
                throw fallbackError;
              }
              cronogramaId = fallbackData.id;
            } else {
              cronogramaId = cronogramaData;
            }
          }
        }
        
        const { data: activityData, error } = await supabase
          .from('cronograma_atividades')
          .insert({
            cronograma_id: cronogramaId,
            evento_id: eventId,
            ...baseData
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
