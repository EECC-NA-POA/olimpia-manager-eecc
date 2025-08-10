import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ScheduleItem, ScheduleForm } from '@/components/event-management/schedule/types';
import { useScheduleForm } from '@/components/event-management/schedule/hooks/useScheduleForm';
import { useScheduleOperations } from '@/components/event-management/schedule/hooks/useScheduleOperations';
import { useMonitorModalities } from '@/hooks/useMonitorModalities';

export const useMonitorScheduleData = (modalidadeFilter?: number | null) => {
  const { user, currentEventId } = useAuth();
  const { data: monitorModalities = [] } = useMonitorModalities();
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get modality IDs that this monitor represents
  const monitorModalityIds = monitorModalities
    .map((m: any) => m?.modalidade_id)
    .filter((id: any): id is number => typeof id === 'number' && !Number.isNaN(id));

  const fetchMonitorSchedule = async () => {
    if (!currentEventId || !user || monitorModalityIds.length === 0) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Fetching monitor schedule for event:', currentEventId);
      console.log('Monitor modalities:', monitorModalityIds);
      
      // Query cronograma_atividades with join to cronogramas and modalidades
      const { data, error } = await supabase
        .from('cronograma_atividades')
        .select(`
          id,
          cronograma_id,
          dia,
          atividade,
          horario_inicio,
          horario_fim,
          local,
          ordem,
          global,
          evento_id,
          recorrente,
          dias_semana,
          horarios_por_dia,
          locais_por_dia,
          data_fim_recorrencia,
          cronogramas(
            id,
            nome
          ),
          cronograma_atividade_modalidades(
            modalidade_id
          )
        `)
        .eq('evento_id', currentEventId)
        .order('dia', { ascending: true })
        .order('horario_inicio', { ascending: true });
      
      if (error) {
        console.error('Error fetching monitor schedule:', error);
        toast.error('Erro ao carregar cronograma');
        setScheduleItems([]);
        return;
      }
      
      console.log('Raw monitor schedule data:', data);
      
      // Transform and filter data
      const transformedData: ScheduleItem[] = (data || [])
        .map(item => {
          const cronogramaData = Array.isArray(item.cronogramas) && item.cronogramas.length > 0 
            ? item.cronogramas[0] 
            : null;
          
          return {
            id: item.id,
            cronograma_id: item.cronograma_id,
            cronograma_nome: cronogramaData?.nome || 'Cronograma sem nome',
            dia: item.dia,
            atividade: item.atividade,
            horario_inicio: item.horario_inicio,
            horario_fim: item.horario_fim,
            local: item.local,
            ordem: item.ordem,
            global: item.global,
            evento_id: item.evento_id,
            recorrente: item.recorrente || false,
            dias_semana: item.dias_semana || [],
            horarios_por_dia: item.horarios_por_dia || {},
            locais_por_dia: item.locais_por_dia || {},
            data_fim_recorrencia: item.data_fim_recorrencia || '',
            modalidades: (item.cronograma_atividade_modalidades || []).map((m: any) => m.modalidade_id)
          };
        })
        .filter(item => {
          // Show global activities and activities related to monitor's modalities
          if (item.global) return true;
          
          // Check if any of the activity's modalidades are in the monitor's modalidades
          return item.modalidades.some(modalidadeId => monitorModalityIds.includes(modalidadeId));
        });
      
      console.log('Filtered monitor schedule items:', transformedData);
      setScheduleItems(transformedData);
    } catch (error) {
      console.error('Error fetching monitor schedule:', error);
      toast.error('Erro ao carregar cronograma');
      setScheduleItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitorSchedule();
  }, [currentEventId, user, monitorModalityIds.length]);

  // Use existing form logic
  const {
    currentItem,
    editingId,
    isDialogOpen,
    setIsDialogOpen,
    handleInputChange,
    handleSelectChange,
    handleModalitiesChange,
    handleDiaToggle,
    handleHorarioChange,
    handleLocalChange,
    handleDataFimRecorrenciaChange,
    openAddDialog: originalOpenAddDialog,
    openEditDialog: originalOpenEditDialog,
    resetForm
  } = useScheduleForm();

  // Use existing operations but with monitor-specific validation
  const { isSaving, handleSave: originalHandleSave, handleDelete: originalHandleDelete } = useScheduleOperations(currentEventId, fetchMonitorSchedule);

  // Override openAddDialog to set default modalidades for monitors
  const openAddDialog = () => {
    // Prevent adding when monitor has no modalities linked
    if (monitorModalityIds.length === 0) {
      toast.error('Você não possui modalidades vinculadas. Contate o organizador.');
      return;
    }

    originalOpenAddDialog();
    // Iniciar com nenhuma modalidade selecionada
    handleModalitiesChange([]);
  };

  // Override openEditDialog with permission check
  const openEditDialog = (item: ScheduleItem) => {
    // Check if monitor can edit this activity
    if (!item.global && !item.modalidades.some(modalidadeId => monitorModalityIds.includes(modalidadeId))) {
      toast.error('Você não tem permissão para editar esta atividade');
      return;
    }
    originalOpenEditDialog(item);
  };

  // Override handleSave with validation
  const handleSave = async () => {
    // Prevent monitors from creating global activities
    if (currentItem.global) {
      toast.error('Monitores não podem criar atividades globais');
      return;
    }

    // Atividades não globais devem ter pelo menos uma modalidade
    if (!currentItem.global && currentItem.modalidades.length === 0) {
      toast.error('Atividades não globais devem ter pelo menos uma modalidade selecionada');
      return;
    }

    // Validate that monitor is only creating/editing activities for their modalidades
    if (!currentItem.global && currentItem.modalidades.length > 0) {
      const invalidModalidades = currentItem.modalidades.filter(modalidadeId => 
        !monitorModalityIds.includes(modalidadeId)
      );
      
      if (invalidModalidades.length > 0) {
        toast.error('Você só pode criar atividades para modalidades que representa');
        return;
      }
    }

    const success = await originalHandleSave(currentItem, editingId);
    if (success) {
      resetForm();
    }
  };

  // Override handleDelete with permission check e execução direta (confirmação via UI)
  const handleDelete = async (id: number) => {
    const item = scheduleItems.find(item => item.id === id);
    if (!item) return;

    // Check if monitor can delete this activity
    if (!item.global && !item.modalidades.some(modalidadeId => monitorModalityIds.includes(modalidadeId))) {
      toast.error('Você não tem permissão para excluir esta atividade');
      return;
    }

    if (item.global) {
      toast.error('Monitores não podem excluir atividades globais');
      return;
    }

    try {
      const { error } = await supabase
        .from('cronograma_atividades')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Atividade do cronograma excluída com sucesso!');
      fetchMonitorSchedule();
    } catch (error) {
      console.error('Erro ao excluir atividade do cronograma (monitor):', error);
      toast.error('Erro ao excluir atividade do cronograma');
    }
  };

  return {
    scheduleItems,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isSaving,
    currentItem,
    editingId,
    openAddDialog,
    openEditDialog,
    handleInputChange,
    handleSelectChange,
    handleModalitiesChange,
    handleDiaToggle,
    handleHorarioChange,
    handleLocalChange,
    handleDataFimRecorrenciaChange,
    handleSave,
    handleDelete
  };
};