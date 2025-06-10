
import React from 'react';
import { Control } from 'react-hook-form';
import { 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RegulationFormValues } from './regulationFormSchema';

interface RegulationBasicFieldsProps {
  control: Control<RegulationFormValues>;
}

export function RegulationBasicFields({ control }: RegulationBasicFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={control}
        name="titulo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Regulamento Geral" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="versao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Versão</FormLabel>
            <FormControl>
              <Input placeholder="Ex: 1.0" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="regulamento_link"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Link do Regulamento (opcional)</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: https://example.com/regulamento.pdf" 
                type="url"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>
              Link externo para o documento do regulamento, caso exista
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
