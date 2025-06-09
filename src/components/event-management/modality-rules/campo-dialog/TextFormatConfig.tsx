
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

interface TextFormatConfigProps {
  form: UseFormReturn<any>;
}

export function TextFormatConfig({ form }: TextFormatConfigProps) {
  const formatoResultado = form.watch('formato_resultado');

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-blue-50">
      <div className="text-sm font-medium text-blue-900">
        Configurações de Máscara de Resultado
      </div>

      <FormField
        control={form.control}
        name="formato_resultado"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Formato de Resultado (Opcional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="tempo">Tempo (MM:SS.mmm)</SelectItem>
                <SelectItem value="distancia">Distância (metros,cm)</SelectItem>
                <SelectItem value="pontos">Pontos (###.##)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {formatoResultado && (
        <FormField
          control={form.control}
          name="unidade_display"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidade de Exibição</FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    formatoResultado === 'tempo' ? 'ex: min' :
                    formatoResultado === 'distancia' ? 'ex: m' :
                    'ex: pts'
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
