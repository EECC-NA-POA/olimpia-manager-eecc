
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TimeScoreFields } from './TimeScoreFields';
import { PointsScoreFields } from './PointsScoreFields';
import { timeScoreSchema, pointsScoreSchema, TimeScoreFormValues, PointsScoreFormValues } from '../types';

interface ScoreFormProps {
  scoreType: 'time' | 'distance' | 'points';
  initialValues?: any;
  onSubmit: (data: TimeScoreFormValues | PointsScoreFormValues) => void;
  isPending: boolean;
}

export function ScoreForm({ scoreType, initialValues, onSubmit, isPending }: ScoreFormProps) {
  // Choose schema based on score type
  const schema = scoreType === 'time' ? timeScoreSchema : pointsScoreSchema;
  
  // Define the form with proper types
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: initialValues || (
      scoreType === 'time' 
        ? { minutes: 0, seconds: 0, milliseconds: 0, notes: '' } 
        : { score: 0, notes: '' }
    ),
  });

  const handleSubmit = (data: TimeScoreFormValues | PointsScoreFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
        {scoreType === 'time' ? (
          <TimeScoreFields form={form as any} />
        ) : (
          <PointsScoreFields 
            form={form as any} 
            scoreType={scoreType as 'distance' | 'points'} 
          />
        )}
        
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
