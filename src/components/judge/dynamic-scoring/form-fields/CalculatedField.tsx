
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

interface CalculatedFieldProps {
  campo: CampoModelo;
  form: UseFormReturn<any>;
}

export function CalculatedField({ campo, form }: CalculatedFieldProps) {
  return (
    <FormField
      control={form.control}
      name={campo.chave_campo}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {campo.rotulo_campo}
            <span className="text-blue-600 text-xs ml-2">(Calculado)</span>
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              readOnly
              className="bg-blue-50 border-blue-200"
              placeholder="Aguardando cálculo..."
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
