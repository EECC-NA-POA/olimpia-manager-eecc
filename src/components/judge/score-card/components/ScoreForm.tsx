
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TimeScoreFields } from './TimeScoreFields';
import { DistanceScoreFields } from './DistanceScoreFields';
import { PointsScoreFields } from './PointsScoreFields';
import { 
  timeScoreSchema, 
  distanceScoreSchema, 
  pointsScoreSchema,
  TimeScoreFormValues, 
  DistanceScoreFormValues, 
  PointsScoreFormValues 
} from '../types';

interface ScoreFormProps {
  scoreType: 'tempo' | 'distancia' | 'pontos';
  initialValues?: any;
  onSubmit: (data: TimeScoreFormValues | DistanceScoreFormValues | PointsScoreFormValues) => void;
  isPending: boolean;
}

export function ScoreForm({ scoreType, initialValues, onSubmit, isPending }: ScoreFormProps) {
  // Choose schema based on score type
  const getSchema = () => {
    switch (scoreType) {
      case 'tempo':
        return timeScoreSchema;
      case 'distancia':
        return distanceScoreSchema;
      case 'pontos':
        return pointsScoreSchema;
      default:
        return pointsScoreSchema;
    }
  };

  const schema = getSchema();
  
  // Define default values based on score type
  const getDefaultValues = () => {
    if (initialValues) return initialValues;
    
    switch (scoreType) {
      case 'tempo':
        return { minutes: 0, seconds: 0, milliseconds: 0, notes: '' };
      case 'distancia':
      case 'pontos':
        return { score: 0, notes: '' };
      default:
        return { score: 0, notes: '' };
    }
  };
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(),
  });

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  const renderScoreFields = () => {
    switch (scoreType) {
      case 'tempo':
        return <TimeScoreFields form={form as any} />;
      case 'distancia':
        return <DistanceScoreFields form={form as any} />;
      case 'pontos':
        return <PointsScoreFields form={form as any} />;
      default:
        return <PointsScoreFields form={form as any} />;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
        {renderScoreFields()}
        
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
