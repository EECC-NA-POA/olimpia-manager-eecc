
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { eventSchema, EventFormValues } from '../EventFormSchema';
import { createEventWithProfiles } from '../services/eventCreationService';

interface UseCreateEventProps {
  onEventCreated?: () => void;
  onClose: () => void;
}

export function useCreateEvent({ onEventCreated, onClose }: UseCreateEventProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      tipo: 'estadual',
      status_evento: 'ativo',
      visibilidade_publica: true,
      selectedBranches: [],
      taxa_atleta: 0,
      taxa_publico_geral: 0,
    },
  });

  const onSubmit = async (data: EventFormValues) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    setIsLoading(true);
    try {
      await createEventWithProfiles(data, user.id);
      toast.success(`Evento "${data.nome}" cadastrado com sucesso!`);
      form.reset();
      onClose();
      
      // Trigger event list refresh after successful creation
      if (onEventCreated) onEventCreated();
      
      // Also invalidate React Query cache for events
      window.dispatchEvent(new CustomEvent('eventCreated'));
      
    } catch (error: any) {
      console.error('❌ Error creating event:', error);
      
      if (error.code === '23505') {
        if (error.message?.includes('eventos_nome_key') || error.constraint?.includes('nome')) {
          toast.error('Erro: Já existe um evento com este nome. Escolha um nome diferente.');
        } else {
          toast.error('Erro: Já existe um registro com essas informações. Verifique os dados e tente novamente.');
        }
      } else if (error.message?.includes('duplicate key value') || 
                 error.message?.includes('unique constraint')) {
        toast.error('Erro: Já existe um evento com essas informações. Verifique o nome e tente novamente.');
      } else {
        toast.error(`Erro ao cadastrar evento: ${error.message || 'Tente novamente mais tarde'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    onSubmit,
  };
}
