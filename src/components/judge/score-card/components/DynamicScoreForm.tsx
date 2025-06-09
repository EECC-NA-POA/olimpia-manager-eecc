
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { DynamicScoringForm } from '../../dynamic-scoring/DynamicScoringForm';
import { useCamposModelo } from '@/hooks/useDynamicScoring';
import { useDynamicScoringSubmission } from '@/hooks/useDynamicScoringSubmission';
import { CampoModelo } from '@/types/dynamicScoring';

interface DynamicScoreFormProps {
  modeloId: number;
  modalityId: number;
  athleteId: string;
  equipeId?: number;
  eventId: string;
  judgeId: string;
  bateriaId?: number;
  raia?: number;
  initialValues?: any;
  onSuccess?: () => void;
}

export function DynamicScoreForm({
  modeloId,
  modalityId,
  athleteId,
  equipeId,
  eventId,
  judgeId,
  bateriaId,
  raia,
  initialValues,
  onSuccess
}: DynamicScoreFormProps) {
  const { data: campos = [], isLoading } = useCamposModelo(modeloId);
  const submissionMutation = useDynamicScoringSubmission();

  // Create dynamic schema based on campos
  const createSchema = (campos: CampoModelo[]) => {
    const schemaFields: Record<string, z.ZodType> = {};
    
    campos.forEach(campo => {
      let fieldSchema: z.ZodType;
      
      // Campos calculados não precisam de validação obrigatória
      if (campo.tipo_input === 'calculated') {
        fieldSchema = z.any().optional();
      } else {
        switch (campo.tipo_input) {
          case 'number':
          case 'integer':
            fieldSchema = z.coerce.number();
            if (campo.metadados?.min !== undefined) {
              fieldSchema = (fieldSchema as z.ZodNumber).min(campo.metadados.min);
            }
            if (campo.metadados?.max !== undefined) {
              fieldSchema = (fieldSchema as z.ZodNumber).max(campo.metadados.max);
            }
            break;
          case 'text':
          case 'select':
            fieldSchema = z.string();
            break;
          default:
            fieldSchema = z.any();
        }
        
        if (!campo.obrigatorio) {
          fieldSchema = fieldSchema.optional();
        }
      }
      
      schemaFields[campo.chave_campo] = fieldSchema;
    });

    // Add notes field
    schemaFields.notes = z.string().optional();
    
    return z.object(schemaFields);
  };

  const schema = createSchema(campos);
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...initialValues,
      notes: initialValues?.notes || '',
    },
  });

  const handleSubmit = async (data: any) => {
    const { notes, ...formData } = data;
    
    console.log('Submitting dynamic score form:', { formData, notes });
    
    try {
      await submissionMutation.mutateAsync({
        eventId,
        modalityId,
        athleteId,
        equipeId,
        judgeId,
        modeloId,
        bateriaId,
        raia,
        formData,
        notes,
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting dynamic score:', error);
    }
  };

  if (isLoading) {
    return <div>Carregando configuração da modalidade...</div>;
  }

  if (campos.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>Nenhum campo configurado para esta modalidade.</p>
        <p className="text-xs mt-1">
          Configure os campos do modelo na seção "Modelos de Pontuação" do evento.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <DynamicScoringForm 
          form={form} 
          campos={campos}
          modeloId={modeloId}
          modalityId={modalityId}
          eventId={eventId}
          bateriaId={bateriaId}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações adicionais"
                  className="resize-none"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit"
          disabled={submissionMutation.isPending}
          className="w-full"
        >
          {submissionMutation.isPending ? 'Enviando...' : 'Salvar Pontuação'}
        </Button>
      </form>
    </Form>
  );
}
