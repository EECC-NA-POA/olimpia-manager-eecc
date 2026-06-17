
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value || "Masculino"}
              className="flex gap-6 pt-1"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Masculino" id="genero-masculino" />
                <Label htmlFor="genero-masculino" className="cursor-pointer font-normal text-gray-900">Masculino</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Feminino" id="genero-feminino" />
                <Label htmlFor="genero-feminino" className="cursor-pointer font-normal text-gray-900">Feminino</Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
