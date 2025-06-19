
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
    if (!eventId) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('eventos')
        .update({
          nome: data.nome,
          descricao: data.descricao,
          pais: data.pais,
          estado: data.estado,
          cidade: data.cidade,
          tipo: data.tipo,
          data_inicio_evento: data.data_inicio_evento,
          data_fim_evento: data.data_fim_evento,
          data_inicio_inscricao: data.data_inicio_inscricao,
          data_fim_inscricao: data.data_fim_inscricao,
          status_evento: data.status_evento,
          foto_evento: data.foto_evento,
          visibilidade_publica: data.visibilidade_publica,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);
      
      if (error) throw error;
      
      toast.success('Informações do evento atualizadas com sucesso!');
      onUpdate(); // Refresh data
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Erro ao atualizar informações do evento');
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
