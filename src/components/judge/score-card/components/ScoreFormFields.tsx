
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DynamicScoreFields } from './DynamicScoreFields';
import { ModalityRule } from '../../tabs/scores/hooks/useModeloConfiguration';
import { Bateria } from '../../tabs/scores/hooks/useBateriaData';

interface ScoreFormFieldsProps {
  form: UseFormReturn<any>;
  rule: ModalityRule;
  bateriasData: Bateria[];
  onSubmit: (data: any) => void;
  isPending: boolean;
  showModalityInfo?: boolean;
}

export function ScoreFormFields({ 
  form, 
  rule, 
  bateriasData, 
  onSubmit, 
  isPending,
  showModalityInfo = false
}: ScoreFormFieldsProps) {
  console.log('ScoreFormFields - Rendering with isPending:', isPending);
  console.log('ScoreFormFields - Current form values:', form.getValues());
  console.log('ScoreFormFields - Form errors:', form.formState.errors);

  return (
    <>
      <DynamicScoreFields form={form} rule={rule} bateriasData={bateriasData} />
      
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
    </>
  );
}
