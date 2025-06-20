
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { eventBasicInfoSchema, EventBasicInfoFormValues } from './eventFormSchema';
import { Event } from '@/lib/types/database';

interface UseEventBasicInfoFormProps {
  eventId: string | null;
  eventData: Event;
  onUpdate: () => void;
}

export const useEventBasicInfoForm = ({ eventId, eventData, onUpdate }: UseEventBasicInfoFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize form with event data
  const form = useForm<EventBasicInfoFormValues>({
    resolver: zodResolver(eventBasicInfoSchema),
    defaultValues: {
      nome: eventData.nome || '',
      descricao: eventData.descricao || '',
      pais: eventData.pais || 'Brasil',
      estado: eventData.estado || '',
      cidade: eventData.cidade || '',
      tipo: eventData.tipo || 'estadual',
      data_inicio_evento: eventData.data_inicio_evento ? new Date(eventData.data_inicio_evento).toISOString().split('T')[0] : '',
      data_fim_evento: eventData.data_fim_evento ? new Date(eventData.data_fim_evento).toISOString().split('T')[0] : '',
      data_inicio_inscricao: eventData.data_inicio_inscricao ? new Date(eventData.data_inicio_inscricao).toISOString().split('T')[0] : '',
      data_fim_inscricao: eventData.data_fim_inscricao ? new Date(eventData.data_fim_inscricao).toISOString().split('T')[0] : '',
      status_evento: eventData.status_evento || 'ativo',
      foto_evento: eventData.foto_evento || '',
      visibilidade_publica: eventData.visibilidade_publica === undefined ? true : eventData.visibilidade_publica,
    }
  });
  
  const handleStatusChange = (value: string) => {
    form.setValue('status_evento', value as 'ativo' | 'encerrado' | 'suspenso' | 'em_teste');
  };

  const handleTipoChange = (value: string) => {
    form.setValue('tipo', value as 'estadual' | 'nacional' | 'internacional' | 'regional');
  };

  const handleVisibilidadeChange = (checked: boolean) => {
    form.setValue('visibilidade_publica', checked);
  };

  const onSubmit = async (data: EventBasicInfoFormValues) => {
    if (!eventId) {
      console.error('Event ID is missing');
      toast.error('ID do evento não encontrado');
      return;
    }
    
    console.log('Form data before submission:', data);
    console.log('Event ID:', eventId);
    
    setIsLoading(true);
    try {
      // Prepare the update data with proper validation for required fields
      const updateData: any = {
        nome: data.nome,
        descricao: data.descricao,
        tipo: data.tipo,
        status_evento: data.status_evento,
        visibilidade_publica: data.visibilidade_publica,
        updated_at: new Date().toISOString()
      };

      // Only include optional fields if they have values
      if (data.pais && data.pais.trim() !== '') {
        updateData.pais = data.pais;
      }
      
      if (data.estado && data.estado.trim() !== '') {
        updateData.estado = data.estado;
      }
      
      if (data.cidade && data.cidade.trim() !== '') {
        updateData.cidade = data.cidade;
      }
      
      if (data.foto_evento && data.foto_evento.trim() !== '') {
        updateData.foto_evento = data.foto_evento;
      }

      // Handle optional date fields
      if (data.data_inicio_evento && data.data_inicio_evento.trim() !== '') {
        updateData.data_inicio_evento = data.data_inicio_evento;
      }
      
      if (data.data_fim_evento && data.data_fim_evento.trim() !== '') {
        updateData.data_fim_evento = data.data_fim_evento;
      }

      // Handle required date fields - only update if they have values
      if (data.data_inicio_inscricao && data.data_inicio_inscricao.trim() !== '') {
        updateData.data_inicio_inscricao = data.data_inicio_inscricao;
      }
      
      if (data.data_fim_inscricao && data.data_fim_inscricao.trim() !== '') {
        updateData.data_fim_inscricao = data.data_fim_inscricao;
      }

      console.log('Data to be sent to database:', updateData);

      const { data: result, error } = await supabase
        .from('eventos')
        .update(updateData)
        .eq('id', eventId)
        .select();
      
      console.log('Supabase update result:', result);
      console.log('Supabase update error:', error);
      
      if (error) {
        console.error('Database error details:', error);
        throw error;
      }
      
      console.log('Event updated successfully:', result);
      toast.success('Informações do evento atualizadas com sucesso!');
      onUpdate(); // Refresh data
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Erro ao atualizar informações do evento: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    handleStatusChange,
    handleTipoChange,
    handleVisibilidadeChange,
    onSubmit,
    watch: form.watch,
    register: form.register,
    handleSubmit: form.handleSubmit,
    formState: { errors: form.formState.errors }
  };
};
