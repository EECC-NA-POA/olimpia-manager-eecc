
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

interface NumericFieldsConfigProps {
  form: UseFormReturn<any>;
}

export function NumericFieldsConfig({ form }: NumericFieldsConfigProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <FormField
        control={form.control}
        name="min"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Min</FormLabel>
            <FormControl>
              <Input type="number" step="any" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="max"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Max</FormLabel>
            <FormControl>
              <Input type="number" step="any" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="step"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Step</FormLabel>
            <FormControl>
              <Input type="number" step="any" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
