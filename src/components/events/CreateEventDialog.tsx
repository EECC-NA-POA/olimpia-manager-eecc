
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { eventSchema, EventFormValues } from './EventFormSchema';
import { BasicInfoSection } from './BasicInfoSection';
import { DateSelectionSection } from './DateSelectionSection';
import { EventDetailsSection } from './EventDetailsSection';
import { BranchSelectionSection } from './BranchSelectionSection';
import { useBranchData } from '@/hooks/dashboard/useBranchData';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated?: () => void;
}

export function CreateEventDialog({ open, onOpenChange, onEventCreated }: CreateEventDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { branches } = useBranchData();

  // Setup form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      tipo: 'estadual',
      status_evento: 'ativo',
      visibilidade_publica: true,
      selectedBranches: [],
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
      
      // If branches were selected, create the event-branch relationships
      if (data.selectedBranches && data.selectedBranches.length > 0) {
        const branchRelationships = data.selectedBranches.map(branchId => ({
          evento_id: newEvent.id,
          filial_id: branchId
        }));

        const { error: branchError } = await supabase
          .from('eventos_filiais')
          .insert(branchRelationships);

        if (branchError) {
          console.error('Error linking event to branches:', branchError);
          toast.error('Evento criado, mas houve um erro ao vincular filiais');
        }
      }

      toast.success(`Evento "${data.nome}" cadastrado com sucesso!`);
      form.reset();
      onOpenChange(false);
      if (onEventCreated) onEventCreated();
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(`Erro ao cadastrar evento: ${error.message || 'Tente novamente mais tarde'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Evento</DialogTitle>
          <DialogDescription>
            Preencha as informações para criar um novo evento.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicInfoSection form={form} />
            <DateSelectionSection form={form} />
            <EventDetailsSection form={form} />
            <BranchSelectionSection form={form} branches={branches || []} />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-olimpics-green-primary hover:bg-olimpics-green-primary/90"
              >
                {isLoading ? 'Cadastrando...' : 'Cadastrar Evento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
