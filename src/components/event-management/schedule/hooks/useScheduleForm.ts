
import { useState } from 'react';
import { ScheduleForm, ScheduleItem } from '../types';
import { defaultFormValues } from '../constants';

export const useScheduleForm = () => {
  const [currentItem, setCurrentItem] = useState<ScheduleForm>(defaultFormValues);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCurrentItem({
      ...currentItem,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    setCurrentItem({
      ...currentItem,
      [field]: value
    });
  };

  const openAddDialog = () => {
    setEditingId(null);
    setCurrentItem(defaultFormValues);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: ScheduleItem) => {
    // Format date to YYYY-MM-DD for input[type="date"]
    const formattedDate = item.data ? new Date(item.data).toISOString().split('T')[0] : '';
    
    setEditingId(item.id);
    setCurrentItem({
      titulo: item.titulo || '',
      descricao: item.descricao || '',
      local: item.local || '',
      data: formattedDate,
      hora_inicio: item.hora_inicio || '',
      hora_fim: item.hora_fim || '',
      tipo: item.tipo || 'JOGO'
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
    openAddDialog,
    openEditDialog,
    resetForm
  };
};
