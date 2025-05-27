
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
import { BateriaInfo } from './BateriaInfo';
import { ModalityRule } from '../../tabs/scores/hooks/useModalityRules';
import { Bateria } from '../../tabs/scores/hooks/useBateriaData';

interface ScoreFormFieldsProps {
  form: UseFormReturn<any>;
  rule: ModalityRule;
  bateriasData: Bateria[];
  onSubmit: (data: any) => void;
  isPending: boolean;
}

export function ScoreFormFields({ 
  form, 
  rule, 
  bateriasData, 
  onSubmit, 
  isPending 
}: ScoreFormFieldsProps) {
  const handleSubmit = (data: any) => {
    console.log('ScoreFormFields - Form data submitted:', data);
    onSubmit(data);
  };

  return (
    <>
      {/* Show bateria info for relevant rule types */}
      {(rule.regra_tipo === 'distancia' && rule.parametros?.baterias) || 
       rule.regra_tipo === 'baterias' || 
       rule.regra_tipo === 'tempo' ? (
        <BateriaInfo baterias={bateriasData} rule={rule} />
      ) : null}
      
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
        onClick={form.handleSubmit(handleSubmit)}
      >
        {isPending ? 'Enviando...' : 'Salvar Pontuação'}
      </Button>
    </>
  );
}
