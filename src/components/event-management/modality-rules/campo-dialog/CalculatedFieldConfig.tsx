
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CalculatedFieldConfigProps {
  form: UseFormReturn<any>;
}

export function CalculatedFieldConfig({ form }: CalculatedFieldConfigProps) {
  return (
    <div className="space-y-4 border rounded-lg p-4 bg-blue-50">
      <div className="text-sm font-medium text-blue-900">
        Configurações de Campo Calculado
      </div>

      <FormField
        control={form.control}
        name="tipo_calculo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Cálculo</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de cálculo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="colocacao_bateria">Colocação na Bateria</SelectItem>
                <SelectItem value="colocacao_final">Colocação Final</SelectItem>
                <SelectItem value="custom">Cálculo Customizado</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="campo_referencia"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Campo de Referência</FormLabel>
            <FormControl>
              <Input
                placeholder="ex: tempo, pontos, distancia"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="contexto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contexto</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o contexto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bateria">Por Bateria</SelectItem>
                  <SelectItem value="modalidade">Por Modalidade</SelectItem>
                  <SelectItem value="evento">Por Evento</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ordem_calculo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordem de Classificação</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordem" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="asc">Crescente (menor = melhor)</SelectItem>
                  <SelectItem value="desc">Decrescente (maior = melhor)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
