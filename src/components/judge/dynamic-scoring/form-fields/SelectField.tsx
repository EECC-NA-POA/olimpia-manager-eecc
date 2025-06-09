
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CampoModelo } from '@/types/dynamicScoring';

interface SelectFieldProps {
  campo: CampoModelo;
  form: UseFormReturn<any>;
}

export function SelectField({ campo, form }: SelectFieldProps) {
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
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={`Selecione ${campo.rotulo_campo.toLowerCase()}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {campo.metadados?.opcoes?.map((opcao) => (
                <SelectItem key={opcao} value={opcao}>
                  {opcao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
