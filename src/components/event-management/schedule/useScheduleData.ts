
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ScheduleItem, ScheduleForm } from './types';
import { createCronogramaTableIfNotExists } from './utils';

export const defaultFormValues: ScheduleForm = {
  titulo: '',
  descricao: '',
  local: '',
  data: '',
  hora_inicio: '',
  hora_fim: '',
  tipo: 'JOGO'
};

export const useScheduleData = (eventId: string | null) => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentItem, setCurrentItem] = useState<ScheduleForm>(defaultFormValues);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, [eventId]);

  const fetchSchedule = async () => {
    if (!eventId) return;
    
    setIsLoading(true);
    try {
      console.log('Fetching schedule for event:', eventId);
      
      // Try to create table if it doesn't exist
      await createCronogramaTableIfNotExists(supabase);
      
      // Then attempt to fetch data
      const { data, error } = await supabase
        .from('cronograma')
        .select('*')
        .eq('evento_id', eventId)
        .order('data', { ascending: true })
        .order('hora_inicio', { ascending: true });
      
      if (error) {
        console.error('Error fetching schedule:', error);
        toast.error('Erro ao carregar itens de cronograma');
        setScheduleItems([]);
        return;
      }
      
      console.log('Retrieved schedule items:', data);
      setScheduleItems(data || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Erro ao carregar itens de cronograma');
      setScheduleItems([]);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSave = async () => {
    if (!eventId) return;
    
    // Basic validation
    if (!currentItem.titulo || !currentItem.data) {
      toast.error('Preencha pelo menos o título e a data');
      return;
    }
    
    setIsSaving(true);
    try {
      // Ensure table exists before saving
      await createCronogramaTableIfNotExists(supabase);
      
      if (editingId) {
        // Update existing item
        const { error } = await supabase
          .from('cronograma')
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
          .from('cronograma')
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
      fetchSchedule();
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      setEditingId(null);
      setCurrentItem(defaultFormValues);
    } catch (error) {
      console.error('Error saving schedule item:', error);
      toast.error('Erro ao salvar item de cronograma');
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
        .from('cronograma')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Item de cronograma excluído com sucesso!');
      
      // Refresh the list
      fetchSchedule();
    } catch (error) {
      console.error('Error deleting schedule item:', error);
      toast.error('Erro ao excluir item de cronograma');
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
    handleSave,
    handleDelete
  };
};
