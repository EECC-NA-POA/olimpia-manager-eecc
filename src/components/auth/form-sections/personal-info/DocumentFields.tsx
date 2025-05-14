
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InputMask from 'react-input-mask';
import { UseFormReturn } from 'react-hook-form';
import { formRow, formColumn } from '@/lib/utils/form-layout';

interface DocumentFieldsProps {
  form: UseFormReturn<any>;
}

export const DocumentFields = ({ form }: DocumentFieldsProps) => {
  return (
    <div className={formRow}>
      <FormField
        control={form.control}
        name="tipo_documento"
        render={({ field }) => (
          <FormItem className={formColumn}>
            <FormLabel>Tipo de Documento</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue="CPF"
              value="CPF"
              disabled={true}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="CPF" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="CPF">CPF</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="numero_documento"
        render={({ field }) => (
          <FormItem className={formColumn}>
            <FormLabel>Número do Documento</FormLabel>
            <FormControl>
              <InputMask
                mask="999.999.999-99"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              >
                {(inputProps: any) => (
                  <Input
                    {...inputProps}
                    placeholder="000.000.000-00"
                    className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary"
                  />
                )}
              </InputMask>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
