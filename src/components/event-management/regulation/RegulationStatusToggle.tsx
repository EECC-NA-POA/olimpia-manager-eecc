
import React from 'react';
import { Control } from 'react-hook-form';
import { 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel 
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { RegulationFormValues } from './regulationFormSchema';

interface RegulationStatusToggleProps {
  control: Control<RegulationFormValues>;
}

export function RegulationStatusToggle({ control }: RegulationStatusToggleProps) {
  return (
    <FormField
      control={control}
      name="is_ativo"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">Status do Regulamento</FormLabel>
            <FormDescription>
              {field.value ? 'Regulamento ativo para visualização' : 'Regulamento inativo (rascunho)'}
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
