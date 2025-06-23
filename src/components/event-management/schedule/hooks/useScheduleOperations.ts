
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
    
    console.log('=== INICIANDO SALVAMENTO DE ATIVIDADE ===');
    console.log('Event ID:', eventId);
    console.log('Editing ID:', editingId);
    console.log('Current Item:', currentItem);
    
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

      console.log('Base data preparada:', baseData);

      if (editingId) {
        console.log('=== MODO EDIÇÃO ===');
        // Update existing activity
        const { error } = await supabase
          .from('cronograma_atividades')
          .update(baseData)
          .eq('id', editingId);
        
        if (error) {
          console.error('Erro ao atualizar atividade:', error);
          throw error;
        }
        
        console.log('Atividade atualizada com sucesso');
        
        // Update modalities if any
        if (currentItem.modalidades.length > 0) {
          console.log('Atualizando modalidades...');
          // Delete existing modality associations
          const { error: deleteError } = await supabase
            .from('cronograma_atividade_modalidades')
            .delete()
            .eq('cronograma_atividade_id', editingId);
          
          if (deleteError) {
            console.error('Erro ao deletar modalidades existentes:', deleteError);
            throw deleteError;
          }
          
          // Insert new modality associations
          const modalityInserts = currentItem.modalidades.map(modalidadeId => ({
            cronograma_atividade_id: editingId,
            modalidade_id: modalidadeId
          }));
          
          console.log('Inserindo novas modalidades:', modalityInserts);
          
          const { error: modalityError } = await supabase
            .from('cronograma_atividade_modalidades')
            .insert(modalityInserts);
          
          if (modalityError) {
            console.error('Erro ao inserir modalidades:', modalityError);
            throw modalityError;
          }
          
          console.log('Modalidades atualizadas com sucesso');
        }
        
        toast.success('Atividade do cronograma atualizada com sucesso!');
      } else {
        console.log('=== MODO CRIAÇÃO ===');
        // Create new activity
        let cronogramaId = currentItem.cronograma_id;
        
        if (!cronogramaId) {
          console.log('Cronograma ID não fornecido, verificando se existe...');
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
            console.log('Cronograma existente encontrado:', existingCronograma.id);
            cronogramaId = existingCronograma.id;
          } else {
            console.log('Nenhum cronograma existente, criando novo...');
            // Create a default cronograma for this event using RPC function to bypass RLS
            const { data: cronogramaData, error: cronogramaError } = await supabase
              .rpc('create_cronograma_for_event', {
                p_evento_id: eventId,
                p_nome: 'Cronograma Principal'
              });
            
            if (cronogramaError) {
              console.error('Error creating cronograma via RPC:', cronogramaError);
              // Fallback: try direct insert
              console.log('Tentando inserção direta como fallback...');
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
              console.log('Cronograma criado via fallback:', cronogramaId);
            } else {
              cronogramaId = cronogramaData;
              console.log('Cronograma criado via RPC:', cronogramaId);
            }
          }
        }
        
        console.log('Cronograma ID final:', cronogramaId);
        
        const activityData = {
          cronograma_id: cronogramaId,
          evento_id: eventId,
          ...baseData
        };
        
        console.log('Dados finais da atividade para inserção:', activityData);
        
        const { data: insertedActivity, error } = await supabase
          .from('cronograma_atividades')
          .insert(activityData)
          .select()
          .single();
        
        if (error) {
          console.error('Erro ao inserir atividade:', error);
          throw error;
        }
        
        console.log('Atividade inserida com sucesso:', insertedActivity);
        
        // Insert modality associations if any
        if (currentItem.modalidades.length > 0) {
          console.log('Inserindo associações de modalidades...');
          const modalityInserts = currentItem.modalidades.map(modalidadeId => ({
            cronograma_atividade_id: insertedActivity.id,
            modalidade_id: modalidadeId
          }));
          
          console.log('Modalidades para inserir:', modalityInserts);
          
          const { error: modalityError } = await supabase
            .from('cronograma_atividade_modalidades')
            .insert(modalityInserts);
          
          if (modalityError) {
            console.error('Erro ao inserir modalidades:', modalityError);
            throw modalityError;
          }
          
          console.log('Modalidades inseridas com sucesso');
        }
        
        toast.success('Atividade do cronograma adicionada com sucesso!');
      }
      
      console.log('=== SALVAMENTO CONCLUÍDO COM SUCESSO ===');
      
      // Refresh the list
      refreshSchedule();
      
      return true; // Success
    } catch (error) {
      console.error('=== ERRO DURANTE SALVAMENTO ===');
      console.error('Error details:', error);
      console.error('Error message:', (error as any)?.message);
      console.error('Error code:', (error as any)?.code);
      console.error('Error details:', (error as any)?.details);
      console.error('Error hint:', (error as any)?.hint);
      
      toast.error(`Erro ao salvar atividade do cronograma: ${(error as any)?.message || 'Erro desconhecido'}`);
      return false; // Failure
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta atividade do cronograma?')) {
      return;
    }
    
    console.log('=== DELETANDO ATIVIDADE ===');
    console.log('Activity ID:', id);
    
    try {
      const { error } = await supabase
        .from('cronograma_atividades')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao deletar atividade:', error);
        throw error;
      }
      
      console.log('Atividade deletada com sucesso');
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
