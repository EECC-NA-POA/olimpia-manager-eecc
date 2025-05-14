
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { eventSchema, EventFormValues } from './EventFormSchema';
import { BasicInfoSection } from './BasicInfoSection';
import { DateSelectionSection } from './DateSelectionSection';
import { EventDetailsSection } from './EventDetailsSection';

export function EventForm() {
  const [isLoading, setIsLoading] = useState(false);

  // Setup form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      tipo: 'estadual',
      status_evento: 'ativo',
      visibilidade_publica: true,
    },
  });

  const onSubmit = async (data: EventFormValues) => {
    setIsLoading(true);
    try {
      // Format dates to ISO strings
      const eventData = {
        nome: data.nome,
        descricao: data.descricao,
        tipo: data.tipo,
        data_inicio_inscricao: data.data_inicio_inscricao.toISOString().split('T')[0],
        data_fim_inscricao: data.data_fim_inscricao.toISOString().split('T')[0],
        status_evento: data.status_evento,
        visibilidade_publica: data.visibilidade_publica,
        foto_evento: data.foto_evento
      };

      const { error, data: newEvent } = await supabase
        .from('eventos')
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Evento "${data.nome}" cadastrado com sucesso!`,
        variant: "success"
      });
      form.reset();
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: "Erro",
        description: `Erro ao cadastrar evento: ${error.message || 'Tente novamente mais tarde'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInfoSection form={form} />
        <DateSelectionSection form={form} />
        <EventDetailsSection form={form} />

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-olimpics-green-primary hover:bg-olimpics-green-primary/90"
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar Evento'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
