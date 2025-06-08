
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateModelo, useUpdateModelo } from '@/hooks/useDynamicScoring';
import { ModeloModalidade } from '@/types/dynamicScoring';

const modeloSchema = z.object({
  codigo_modelo: z.string().min(1, 'Código é obrigatório'),
  descricao: z.string().optional(),
});

type ModeloFormData = z.infer<typeof modeloSchema>;

interface ModeloModalidadeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  modalidadeId: number | null;
  editingModelo?: ModeloModalidade | null;
}

export function ModeloModalidadeDialog({
  isOpen,
  onClose,
  modalidadeId,
  editingModelo
}: ModeloModalidadeDialogProps) {
  const createModeloMutation = useCreateModelo();
  const updateModeloMutation = useUpdateModelo();

  const form = useForm<ModeloFormData>({
    resolver: zodResolver(modeloSchema),
    defaultValues: {
      codigo_modelo: editingModelo?.codigo_modelo || '',
      descricao: editingModelo?.descricao || '',
    },
  });

  const onSubmit = async (data: ModeloFormData) => {
    if (!modalidadeId) return;

    try {
      if (editingModelo) {
        await updateModeloMutation.mutateAsync({
          id: editingModelo.id,
          codigo_modelo: data.codigo_modelo,
          descricao: data.descricao || null,
        });
      } else {
        await createModeloMutation.mutateAsync({
          modalidade_id: modalidadeId,
          codigo_modelo: data.codigo_modelo,
          descricao: data.descricao || null,
        });
      }
      
      handleClose();
    } catch (error) {
      console.error('Error saving modelo:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const isPending = createModeloMutation.isPending || updateModeloMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingModelo ? 'Editar Modelo' : 'Novo Modelo'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="codigo_modelo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código do Modelo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: corrida_tempo, campo_tentativas"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição do modelo de pontuação"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
