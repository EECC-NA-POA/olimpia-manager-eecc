
import { useScheduleFetch } from './hooks/useScheduleFetch';
import { useScheduleForm } from './hooks/useScheduleForm';
import { useScheduleOperations } from './hooks/useScheduleOperations';

export const useScheduleData = (eventId: string | null) => {
  const { scheduleItems, isLoading, fetchSchedule } = useScheduleFetch(eventId);
  
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
    handleDataFimRecorrenciaChange,
    openAddDialog,
    openEditDialog,
    resetForm
  } = useScheduleForm();

  const { isSaving, handleSave, handleDelete } = useScheduleOperations(eventId, fetchSchedule);

  const handleSaveWithReset = async () => {
    const success = await handleSave(currentItem, editingId);
    if (success) {
      resetForm();
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
    handleDataFimRecorrenciaChange,
    handleSave: handleSaveWithReset,
    handleDelete
  };
};

// Re-export the default form values for backward compatibility
export { defaultFormValues } from './constants';
