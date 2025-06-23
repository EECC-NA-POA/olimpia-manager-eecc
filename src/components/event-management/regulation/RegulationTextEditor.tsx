
import React from 'react';
import { Control } from 'react-hook-form';
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { RichTextEditor } from './RichTextEditor';
import { RegulationFormValues } from './regulationFormSchema';

interface RegulationTextEditorProps {
  control: Control<RegulationFormValues>;
}

export function RegulationTextEditor({ control }: RegulationTextEditorProps) {
  return (
    <FormField
      control={control}
      name="regulamento_texto"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Texto do Regulamento</FormLabel>
          <FormControl>
            <RichTextEditor 
              value={field.value} 
              onChange={field.onChange} 
              placeholder="Digite o texto do regulamento aqui"
              className="min-h-[300px]"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
