
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { CampoModelo } from '@/types/dynamicScoring';
import { MaskedResultInput } from '../MaskedResultInput';

interface TextFieldProps {
  campo: CampoModelo;
  form: UseFormReturn<any>;
}

export function TextField({ campo, form }: TextFieldProps) {
  return (
    <FormField
      control={form.control}
      name={campo.chave_campo}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {campo.rotulo_campo}
            {campo.obrigatorio && <span className="text-red-500 ml-1">*</span>}
            {campo.metadados?.formato_resultado && (
              <span className="text-green-600 text-xs ml-2">
                ({campo.metadados.formato_resultado})
              </span>
            )}
          </FormLabel>
          <FormControl>
            <MaskedResultInput
              campo={campo}
              form={form}
              value={field.value || ''}
              onChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
