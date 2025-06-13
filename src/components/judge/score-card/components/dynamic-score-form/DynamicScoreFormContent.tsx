
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { DynamicScoringForm } from '../../../dynamic-scoring/DynamicScoringForm';
import { CampoModelo } from '@/types/dynamicScoring';

interface DynamicScoreFormContentProps {
  form: UseFormReturn<any>;
  campos: CampoModelo[];
  modeloId: number;
  modalityId: number;
  eventId: string;
  bateriaId?: number;
  isSubmitting: boolean;
  onSubmit: (data: any) => void;
}

export function DynamicScoreFormContent({
  form,
  campos,
  modeloId,
  modalityId,
  eventId,
  bateriaId,
  isSubmitting,
  onSubmit
}: DynamicScoreFormContentProps) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Enviando...' : 'Salvar Pontuação'}
      </Button>
    </form>
  );
}
