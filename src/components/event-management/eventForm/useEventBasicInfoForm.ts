
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
      pais: eventData.pais || '',
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
    console.log('Current event data for comparison:', eventData);
    
    setIsLoading(true);
    try {
      // Prepare the update data - handle empty strings properly
      const updateData = {
        nome: data.nome.trim(),
        descricao: data.descricao.trim(),
        tipo: data.tipo,
        status_evento: data.status_evento,
        visibilidade_publica: data.visibilidade_publica,
        pais: data.pais && data.pais.trim() !== '' ? data.pais.trim() : null,
        estado: data.estado && data.estado.trim() !== '' ? data.estado.trim() : null,
        cidade: data.cidade && data.cidade.trim() !== '' ? data.cidade.trim() : null,
        foto_evento: data.foto_evento && data.foto_evento.trim() !== '' ? data.foto_evento.trim() : null,
        data_inicio_evento: data.data_inicio_evento && data.data_inicio_evento.trim() !== '' ? data.data_inicio_evento.trim() : null,
        data_fim_evento: data.data_fim_evento && data.data_fim_evento.trim() !== '' ? data.data_fim_evento.trim() : null,
        data_inicio_inscricao: data.data_inicio_inscricao && data.data_inicio_inscricao.trim() !== '' ? data.data_inicio_inscricao.trim() : null,
        data_fim_inscricao: data.data_fim_inscricao && data.data_fim_inscricao.trim() !== '' ? data.data_fim_inscricao.trim() : null,
        updated_at: new Date().toISOString()
      };

      console.log('Data to be sent to database:', updateData);

      // First, let's verify the event exists
      const { data: existingEvent, error: fetchError } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventId)
        .single();

      if (fetchError) {
        console.error('Error fetching existing event:', fetchError);
        throw new Error('Erro ao verificar evento existente');
      }

      if (!existingEvent) {
        console.error('Event not found with ID:', eventId);
        throw new Error('Evento não encontrado');
      }

      console.log('Existing event data:', existingEvent);

      // Perform the update
      const { data: result, error } = await supabase
        .from('eventos')
        .update(updateData)
        .eq('id', eventId)
        .select();
      
      console.log('Supabase update result:', result);
      console.log('Supabase update error:', error);
      
      if (error) {
        console.error('Database error details:', error);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        throw error;
      }
      
      // Check if any rows were updated
      if (result && result.length > 0) {
        console.log('Event updated successfully:', result[0]);
        toast.success('Informações do evento atualizadas com sucesso!');
        onUpdate(); // Refresh data
      } else {
        console.warn('No rows were updated - this might indicate the data is the same');
        
        // Let's compare the data to see if there were actual changes
        const hasChanges = Object.keys(updateData).some(key => {
          if (key === 'updated_at') return false; // Skip the updated_at field
          const currentValue = existingEvent[key];
          const newValue = updateData[key];
          
          // Handle null comparisons
          if (currentValue === null && newValue === null) return false;
          if (currentValue === null && newValue === '') return false;
          if (currentValue === '' && newValue === null) return false;
          
          return currentValue !== newValue;
        });
        
        if (hasChanges) {
          console.log('Changes detected but no rows updated - this is unexpected');
          toast.warning('Houve um problema ao salvar as alterações. Tente novamente.');
        } else {
          console.log('No actual changes detected');
          toast.info('Nenhuma alteração foi detectada nos dados');
        }
      }
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
