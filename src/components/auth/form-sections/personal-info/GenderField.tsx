
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from 'react-hook-form';

interface GenderFieldProps {
  form: UseFormReturn<any>;
}

export const GenderField = ({ form }: GenderFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="genero"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-gray-700">Selecione o Gênero</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value || "Masculino"}
          >
            <FormControl>
              <SelectTrigger className="bg-white text-gray-900">
                <SelectValue placeholder="Selecione o gênero" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white">
              <SelectItem value="Masculino">Masculino</SelectItem>
              <SelectItem value="Feminino">Feminino</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
