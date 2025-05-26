
import { useState } from 'react';
import { ScheduleForm, ScheduleItem } from '../types';
import { defaultFormValues } from '../constants';

export const useScheduleForm = () => {
  const [currentItem, setCurrentItem] = useState<ScheduleForm>(defaultFormValues);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setCurrentItem({
        ...currentItem,
        [name]: checked
      });
    } else {
      setCurrentItem({
        ...currentItem,
        [name]: value
      });
    }
  };

  const handleSelectChange = (field: string, value: string | number | boolean) => {
    setCurrentItem({
      ...currentItem,
      [field]: value
    });
  };

  const handleModalitiesChange = (modalidades: number[]) => {
    setCurrentItem({
      ...currentItem,
      modalidades
    });
  };

  const openAddDialog = () => {
    setEditingId(null);
    setCurrentItem(defaultFormValues);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: ScheduleItem) => {
    setEditingId(item.id);
    setCurrentItem({
      cronograma_id: item.cronograma_id,
      atividade: item.atividade,
      dia: item.dia,
      horario_inicio: item.horario_inicio,
      horario_fim: item.horario_fim,
      local: item.local,
      global: item.global,
      modalidades: item.modalidades
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setCurrentItem(defaultFormValues);
  };

  return {
    currentItem,
    editingId,
    isDialogOpen,
    setIsDialogOpen,
    handleInputChange,
    handleSelectChange,
    handleModalitiesChange,
    openAddDialog,
    openEditDialog,
    resetForm
  };
};
