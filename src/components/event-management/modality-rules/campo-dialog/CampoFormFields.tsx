
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CampoFormFieldsProps {
  form: UseFormReturn<any>;
}

export function CampoFormFields({ form }: CampoFormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="chave_campo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Chave do Campo</FormLabel>
            <FormControl>
              <Input
                placeholder="ex: tentativa_1, pontos_set, colocacao_bateria"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="rotulo_campo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rótulo do Campo</FormLabel>
            <FormControl>
              <Input
                placeholder="ex: Tentativa 1, Pontos do Set, Colocação na Bateria"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tipo_input"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Input</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="number">Número</SelectItem>
                <SelectItem value="integer">Número Inteiro</SelectItem>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="select">Seleção</SelectItem>
                <SelectItem value="calculated">Campo Calculado</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="ordem_exibicao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordem</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="obrigatorio"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Obrigatório</FormLabel>
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
      </div>
    </>
  );
}
