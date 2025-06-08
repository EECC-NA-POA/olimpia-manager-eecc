
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useCreateCampo, useUpdateCampo } from '@/hooks/useDynamicScoring';
import { CampoModelo } from '@/types/dynamicScoring';

const campoSchema = z.object({
  chave_campo: z.string().min(1, 'Chave é obrigatória'),
  rotulo_campo: z.string().min(1, 'Rótulo é obrigatório'),
  tipo_input: z.enum(['number', 'text', 'select']),
  obrigatorio: z.boolean(),
  ordem_exibicao: z.coerce.number().min(1),
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
  step: z.coerce.number().optional(),
  opcoes: z.string().optional(),
});

type CampoFormData = z.infer<typeof campoSchema>;

interface CampoModeloDialogProps {
  isOpen: boolean;
  onClose: () => void;
  modeloId: number;
  editingCampo?: CampoModelo | null;
}

export function CampoModeloDialog({
  isOpen,
  onClose,
  modeloId,
  editingCampo
}: CampoModeloDialogProps) {
  const createCampoMutation = useCreateCampo();
  const updateCampoMutation = useUpdateCampo();

  const form = useForm<CampoFormData>({
    resolver: zodResolver(campoSchema),
    defaultValues: {
      chave_campo: editingCampo?.chave_campo || '',
      rotulo_campo: editingCampo?.rotulo_campo || '',
      tipo_input: editingCampo?.tipo_input || 'number',
      obrigatorio: editingCampo?.obrigatorio ?? true,
      ordem_exibicao: editingCampo?.ordem_exibicao || 1,
      min: editingCampo?.metadados?.min,
      max: editingCampo?.metadados?.max,
      step: editingCampo?.metadados?.step,
      opcoes: editingCampo?.metadados?.opcoes?.join('\n') || '',
    },
  });

  const tipoInput = form.watch('tipo_input');

  const onSubmit = async (data: CampoFormData) => {
    try {
      const metadados: any = {};
      
      if (data.min !== undefined && data.min !== null) metadados.min = data.min;
      if (data.max !== undefined && data.max !== null) metadados.max = data.max;
      if (data.step !== undefined && data.step !== null) metadados.step = data.step;
      
      if (data.tipo_input === 'select' && data.opcoes) {
        metadados.opcoes = data.opcoes.split('\n').filter(opt => opt.trim());
      }

      const campoData = {
        modelo_id: modeloId,
        chave_campo: data.chave_campo,
        rotulo_campo: data.rotulo_campo,
        tipo_input: data.tipo_input,
        obrigatorio: data.obrigatorio,
        ordem_exibicao: data.ordem_exibicao,
        metadados: Object.keys(metadados).length > 0 ? metadados : null,
      };

      if (editingCampo) {
        await updateCampoMutation.mutateAsync({
          id: editingCampo.id,
          modelo_id: modeloId,
          ...campoData,
        });
      } else {
        await createCampoMutation.mutateAsync(campoData);
      }
      
      handleClose();
    } catch (error) {
      console.error('Error saving campo:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const isPending = createCampoMutation.isPending || updateCampoMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingCampo ? 'Editar Campo' : 'Novo Campo'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="chave_campo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave do Campo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: tentativa_1, pontos_set"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rotulo_campo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rótulo do Campo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: Tentativa 1, Pontos do Set"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo_input"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Input</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="select">Seleção</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ordem_exibicao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordem</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="obrigatorio"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Obrigatório</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {tipoInput === 'number' && (
              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="step"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Step</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {tipoInput === 'select' && (
              <FormField
                control={form.control}
                name="opcoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opções (uma por linha)</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
