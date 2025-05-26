
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

interface RegulationVisibilityToggleProps {
  control: Control<RegulationFormValues>;
}

export function RegulationVisibilityToggle({ control }: RegulationVisibilityToggleProps) {
  return (
    <FormField
      control={control}
      name="is_regulamento_texto"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">Exibir Texto na Página Pública</FormLabel>
            <FormDescription>
              {field.value 
                ? 'O texto do regulamento será exibido na página dos atletas' 
                : 'Apenas o link externo será exibido na página dos atletas (se disponível)'}
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
