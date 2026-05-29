
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
  const tipoDocumento = form.watch('tipo_documento');

  const handleDocTypeChange = (value: string) => {
    form.setValue('tipo_documento', value);
    form.setValue('numero_documento', ''); // Clear document number when type changes
  };

  return (
    <div className={formRow}>
      <FormField
        control={form.control}
        name="tipo_documento"
        render={({ field }) => (
          <FormItem className={formColumn}>
            <FormLabel className="text-gray-700">Tipo de Documento</FormLabel>
            <Select
              onValueChange={handleDocTypeChange}
              value={field.value || 'CPF'}
            >
              <FormControl>
                <SelectTrigger className="bg-white text-gray-900">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white">
                <SelectItem value="CPF">CPF</SelectItem>
                <SelectItem value="PASSAPORTE">Passaporte</SelectItem>
                <SelectItem value="OUTRO">Outro</SelectItem>
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
            <FormLabel className="text-gray-700">
              {tipoDocumento === 'PASSAPORTE' ? 'Número do Passaporte' : 'Número do Documento'}
            </FormLabel>
            <FormControl>
              {tipoDocumento === 'CPF' ? (
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
                      className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary bg-white text-gray-900"
                    />
                  )}
                </InputMask>
              ) : tipoDocumento === 'PASSAPORTE' ? (
                <Input
                  {...field}
                  placeholder="A12345678"
                  maxLength={9}
                  className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary bg-white text-gray-900 uppercase"
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                    field.onChange(value);
                  }}
                />
              ) : (
                <Input
                  {...field}
                  placeholder="Número do documento"
                  className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary bg-white text-gray-900"
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
