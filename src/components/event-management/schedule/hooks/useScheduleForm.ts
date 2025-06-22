
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

  const handleDiaToggle = (dia: string, checked: boolean) => {
    const novosDias = checked 
      ? [...currentItem.dias_semana, dia]
      : currentItem.dias_semana.filter(d => d !== dia);
    
    const novosHorarios = { ...currentItem.horarios_por_dia };
    if (!checked) {
      delete novosHorarios[dia];
    }
    
    setCurrentItem({
      ...currentItem,
      dias_semana: novosDias,
      horarios_por_dia: novosHorarios
    });
  };

  const handleHorarioChange = (dia: string, tipo: 'inicio' | 'fim', valor: string) => {
    const horarioAtual = currentItem.horarios_por_dia[dia] || { inicio: '', fim: '' };
    
    setCurrentItem({
      ...currentItem,
      horarios_por_dia: {
        ...currentItem.horarios_por_dia,
        [dia]: {
          ...horarioAtual,
          [tipo]: valor
        }
      }
    });
  };

  const handleDataFimRecorrenciaChange = (data: string) => {
    setCurrentItem({
      ...currentItem,
      data_fim_recorrencia: data
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
      recorrente: item.recorrente || false,
      dias_semana: item.dias_semana || [],
      horarios_por_dia: item.horarios_por_dia || {},
      data_fim_recorrencia: item.data_fim_recorrencia || '',
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
    handleDiaToggle,
    handleHorarioChange,
    handleDataFimRecorrenciaChange,
    openAddDialog,
    openEditDialog,
    resetForm
  };
};
