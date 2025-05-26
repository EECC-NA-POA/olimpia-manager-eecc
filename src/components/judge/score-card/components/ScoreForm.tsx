
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

interface ScoreFormProps {
  modalityId: number;
  initialValues?: any;
  onSubmit: (data: any) => void;
  isPending: boolean;
  modalityRule?: any; // Add optional modality rule prop
}

export function ScoreForm({ modalityId, initialValues, onSubmit, isPending, modalityRule }: ScoreFormProps) {
  // Use passed modalityRule if available, otherwise fetch it
  const { data: fetchedRule, isLoading } = useModalityRules(modalityId);
  const rule = modalityRule || fetchedRule;
  
  console.log('ScoreForm - modalityId:', modalityId);
  console.log('ScoreForm - passed modalityRule:', modalityRule);
  console.log('ScoreForm - fetchedRule:', fetchedRule);
  console.log('ScoreForm - final rule:', rule);
  console.log('ScoreForm - initialValues:', initialValues);
  
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
    console.log('ScoreForm - Form data submitted:', data);
    onSubmit(data);
  };

  if (!modalityRule && isLoading) {
    return <div>Carregando configuração da modalidade...</div>;
  }

  if (!rule) {
    return <div>Erro ao carregar configuração da modalidade</div>;
  }

  console.log('ScoreForm - Rendering form with rule:', rule);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-3">
            Modalidade: {rule.regra_tipo} 
            {rule.parametros?.unidade && ` (${rule.parametros.unidade})`}
          </h4>
          <DynamicScoreFields form={form} rule={rule} />
        </div>
        
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
