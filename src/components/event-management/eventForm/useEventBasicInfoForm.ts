
import { useState, useEffect } from 'react';
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
  
  const getFormValues = (data: Event): EventBasicInfoFormValues => ({
    nome: data.nome || '',
    descricao: data.descricao || '',
    pais: data.pais || '',
    estado: data.estado || '',
    cidade: data.cidade || '',
    tipo: data.tipo || 'estadual',
    data_inicio_evento: data.data_inicio_evento ? new Date(data.data_inicio_evento).toISOString().split('T')[0] : '',
    data_fim_evento: data.data_fim_evento ? new Date(data.data_fim_evento).toISOString().split('T')[0] : '',
    data_inicio_inscricao: data.data_inicio_inscricao ? new Date(data.data_inicio_inscricao).toISOString().split('T')[0] : '',
    data_fim_inscricao: data.data_fim_inscricao ? new Date(data.data_fim_inscricao).toISOString().split('T')[0] : '',
    status_evento: data.status_evento || 'ativo',
    foto_evento: data.foto_evento || '',
    visibilidade_publica: data.visibilidade_publica === undefined ? true : data.visibilidade_publica,
  });
  
  // Initialize form with event data
  const form = useForm<EventBasicInfoFormValues>({
    resolver: zodResolver(eventBasicInfoSchema),
    defaultValues: getFormValues(eventData)
  });
  
  // Reset form when eventData changes (e.g., after successful update)
  useEffect(() => {
    form.reset(getFormValues(eventData));
  }, [eventData, form]);

  const handleStatusChange = (value: string) => {
    form.setValue('status_evento', value as 'ativo' | 'encerrado' | 'suspenso' | 'em_teste' | 'encerrado_oculto', { 
      shouldDirty: true,
      shouldTouch: true 
    });
  };

  const handleTipoChange = (value: string) => {
    form.setValue('tipo', value as 'estadual' | 'nacional' | 'internacional' | 'regional', { 
      shouldDirty: true,
      shouldTouch: true 
    });
  };

  const handleVisibilidadeChange = (checked: boolean) => {
    form.setValue('visibilidade_publica', checked, { 
      shouldDirty: true,
      shouldTouch: true 
    });
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

      // Perform the update without .select() to avoid issues
      const { error, count } = await supabase
        .from('eventos')
        .update(updateData)
        .eq('id', eventId);
      
      console.log('Supabase update error:', error);
      console.log('Supabase update count:', count);
      
      if (error) {
        console.error('Database error details:', error);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        throw error;
      }
      
      // Check count to see if rows were affected
      if (count !== null && count > 0) {
        console.log('Event updated successfully, rows affected:', count);
        toast.success('Informações do evento atualizadas com sucesso!');
        onUpdate(); // Refresh data
      } else {
        // Fallback: Try to fetch the updated record to verify the update worked
        const { data: verifyData, error: verifyError } = await supabase
          .from('eventos')
          .select('*')
          .eq('id', eventId)
          .single();
        
        if (!verifyError && verifyData) {
          console.log('Update appears to have worked, verification data:', verifyData);
          toast.success('Informações do evento atualizadas com sucesso!');
          onUpdate(); // Refresh data
        } else {
          console.warn('Update may have failed or no changes were made');
          toast.warning('Não foi possível confirmar se as alterações foram salvas. Verifique os dados.');
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
