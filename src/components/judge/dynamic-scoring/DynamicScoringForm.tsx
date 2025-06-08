
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CampoModelo } from '@/types/dynamicScoring';

interface DynamicScoringFormProps {
  form: UseFormReturn<any>;
  campos: CampoModelo[];
}

export function DynamicScoringForm({ form, campos }: DynamicScoringFormProps) {
  const renderField = (campo: CampoModelo) => {
    switch (campo.tipo_input) {
      case 'number':
        return (
          <FormField
            key={campo.id}
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
                    step={campo.metadados?.step || 'any'}
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

      case 'text':
        return (
          <FormField
            key={campo.id}
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
                    type="text"
                    placeholder={`Digite ${campo.rotulo_campo.toLowerCase()}`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'select':
        return (
          <FormField
            key={campo.id}
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

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {campos
        .sort((a, b) => a.ordem_exibicao - b.ordem_exibicao)
        .map(renderField)}
    </div>
  );
}
