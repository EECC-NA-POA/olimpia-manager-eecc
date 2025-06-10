
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CampoModelo } from '@/types/dynamicScoring';

interface NumberFieldProps {
  campo: CampoModelo;
  form: UseFormReturn<any>;
}

export function NumberField({ campo, form }: NumberFieldProps) {
  return (
    <FormField
      control={form.control}
      name={campo.chave_campo}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {campo.rotulo_campo}
            {campo.obrigatorio && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              type="number"
              step={campo.tipo_input === 'integer' ? '1' : (campo.metadados?.step || 'any')}
              min={campo.metadados?.min}
              max={campo.metadados?.max}
              placeholder={`Digite ${campo.rotulo_campo.toLowerCase()}`}
              {...field}
              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
