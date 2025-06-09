
import React, { useEffect } from 'react';
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
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useCreateCampo, useUpdateCampo } from '@/hooks/useDynamicScoring';
import { CampoModelo } from '@/types/dynamicScoring';
import { CampoFormFields } from './campo-dialog/CampoFormFields';
import { NumericFieldsConfig } from './campo-dialog/NumericFieldsConfig';
import { SelectOptionsConfig } from './campo-dialog/SelectOptionsConfig';
import { TextFormatConfig } from './campo-dialog/TextFormatConfig';
import { CalculatedFieldConfig } from './campo-dialog/CalculatedFieldConfig';

const campoSchema = z.object({
  chave_campo: z.string().min(1, 'Chave é obrigatória'),
  rotulo_campo: z.string().min(1, 'Rótulo é obrigatório'),
  tipo_input: z.enum(['number', 'integer', 'text', 'select', 'calculated']),
  obrigatorio: z.boolean(),
  ordem_exibicao: z.coerce.number().min(1),
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
  step: z.coerce.number().optional(),
  opcoes: z.string().optional(),
  // Campos para calculated
  tipo_calculo: z.enum(['colocacao_bateria', 'colocacao_final', 'custom']).optional(),
  campo_referencia: z.string().optional(),
  contexto: z.enum(['bateria', 'modalidade', 'evento']).optional(),
  ordem_calculo: z.enum(['asc', 'desc']).optional(),
  // Novos campos para máscaras
  formato_resultado: z.enum(['tempo', 'distancia', 'pontos']).optional(),
  unidade_display: z.string().optional(),
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
      chave_campo: '',
      rotulo_campo: '',
      tipo_input: 'number',
      obrigatorio: true,
      ordem_exibicao: 1,
      min: undefined,
      max: undefined,
      step: undefined,
      opcoes: '',
      tipo_calculo: undefined,
      campo_referencia: '',
      contexto: undefined,
      ordem_calculo: 'asc',
      formato_resultado: undefined,
      unidade_display: '',
    },
  });

  // Reset form when editingCampo changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      if (editingCampo) {
        form.reset({
          chave_campo: editingCampo.chave_campo || '',
          rotulo_campo: editingCampo.rotulo_campo || '',
          tipo_input: editingCampo.tipo_input || 'number',
          obrigatorio: editingCampo.obrigatorio ?? true,
          ordem_exibicao: editingCampo.ordem_exibicao || 1,
          min: editingCampo.metadados?.min,
          max: editingCampo.metadados?.max,
          step: editingCampo.metadados?.step,
          opcoes: editingCampo.metadados?.opcoes?.join('\n') || '',
          tipo_calculo: editingCampo.metadados?.tipo_calculo,
          campo_referencia: editingCampo.metadados?.campo_referencia || '',
          contexto: editingCampo.metadados?.contexto,
          ordem_calculo: editingCampo.metadados?.ordem_calculo || 'asc',
          formato_resultado: editingCampo.metadados?.formato_resultado,
          unidade_display: editingCampo.metadados?.unidade_display || '',
        });
      } else {
        form.reset({
          chave_campo: '',
          rotulo_campo: '',
          tipo_input: 'number',
          obrigatorio: true,
          ordem_exibicao: 1,
          min: undefined,
          max: undefined,
          step: undefined,
          opcoes: '',
          tipo_calculo: undefined,
          campo_referencia: '',
          contexto: undefined,
          ordem_calculo: 'asc',
          formato_resultado: undefined,
          unidade_display: '',
        });
      }
    }
  }, [isOpen, editingCampo, form]);

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

      if (data.tipo_input === 'calculated') {
        metadados.tipo_calculo = data.tipo_calculo;
        metadados.campo_referencia = data.campo_referencia;
        metadados.contexto = data.contexto;
        metadados.ordem_calculo = data.ordem_calculo;
      }

      // Adicionar metadados de máscara se for campo de texto com formato
      if (data.tipo_input === 'text' && data.formato_resultado) {
        metadados.formato_resultado = data.formato_resultado;
        metadados.unidade_display = data.unidade_display;
        
        // Definir máscara automaticamente baseada no formato
        switch (data.formato_resultado) {
          case 'tempo':
            metadados.mascara = 'HH:MM:SS';
            break;
          case 'distancia':
            metadados.mascara = '##,## m';
            break;
          case 'pontos':
            metadados.mascara = '###.##';
            break;
        }
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
    onClose();
  };

  const isPending = createCampoMutation.isPending || updateCampoMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCampo ? 'Editar Campo' : 'Novo Campo'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CampoFormFields form={form} />

            {(tipoInput === 'number' || tipoInput === 'integer') && (
              <NumericFieldsConfig form={form} />
            )}

            {tipoInput === 'select' && (
              <SelectOptionsConfig form={form} />
            )}

            {tipoInput === 'text' && (
              <TextFormatConfig form={form} />
            )}

            {tipoInput === 'calculated' && (
              <CalculatedFieldConfig form={form} />
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
