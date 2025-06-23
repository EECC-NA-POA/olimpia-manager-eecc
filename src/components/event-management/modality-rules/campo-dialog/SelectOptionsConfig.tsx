
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface SelectOptionsConfigProps {
  form: UseFormReturn<any>;
}

export function SelectOptionsConfig({ form }: SelectOptionsConfigProps) {
  return (
    <FormField
      control={form.control}
      name="opcoes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Opções (uma por linha)</FormLabel>
          <FormControl>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
