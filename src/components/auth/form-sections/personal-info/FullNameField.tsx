
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from 'react-hook-form';

interface FullNameFieldProps {
  form: UseFormReturn<any>;
}

export const FullNameField = ({ form }: FullNameFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="nome"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-left w-full">Nome Completo</FormLabel>
          <FormControl>
            <Input
              placeholder="Seu nome completo"
              className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
