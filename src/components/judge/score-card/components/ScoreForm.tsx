
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DynamicScoreFields } from './DynamicScoreFields';
import { useModalityRules } from '../../tabs/scores/hooks/useModalityRules';
import { createDynamicSchema } from '../utils/schemaUtils';
import { getDefaultValues } from '../utils/defaultValuesUtils';
import { prepareSubmissionData } from '../utils/formSubmissionUtils';

interface ScoreFormProps {
  modalityId: number;
  initialValues?: any;
  onSubmit: (data: any) => void;
  isPending: boolean;
}

export function ScoreForm({ modalityId, initialValues, onSubmit, isPending }: ScoreFormProps) {
  const { data: rule, isLoading } = useModalityRules(modalityId);
  
  // Create schema based on rule
  const schema = rule ? createDynamicSchema(rule.regra_tipo, rule.parametros) : z.object({
    score: z.coerce.number().min(0).default(0),
    notes: z.string().optional(),
  });
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(initialValues, rule),
  });

  const handleSubmit = (data: any) => {
    const preparedData = prepareSubmissionData(data, rule);
    onSubmit(preparedData);
  };

  if (isLoading) {
    return <div>Carregando configuração da modalidade...</div>;
  }

  if (!rule) {
    return <div>Erro ao carregar configuração da modalidade</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
        <DynamicScoreFields form={form} rule={rule} />
        
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
          disabled={isPending}
          className="w-full"
        >
          {isPending ? 'Enviando...' : 'Salvar Pontuação'}
        </Button>
      </form>
    </Form>
  );
}
