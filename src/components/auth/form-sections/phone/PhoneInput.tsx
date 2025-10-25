
import React from 'react';
import { Flag, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from 'react-hook-form';
import InputMask from 'react-input-mask';
import { formRow, formColumn } from '@/lib/utils/form-layout';

const countries = [
  { name: 'Argentina', code: 'AR', ddi: '+54' },
  { name: 'Bolívia', code: 'BO', ddi: '+591' },
  { name: 'Brasil', code: 'BR', ddi: '+55' },
  { name: 'Chile', code: 'CL', ddi: '+56' },
  { name: 'Colômbia', code: 'CO', ddi: '+57' },
  { name: 'Equador', code: 'EC', ddi: '+593' },
  { name: 'Espanha', code: 'ES', ddi: '+34' },
  { name: 'Paraguai', code: 'PY', ddi: '+595' },
  { name: 'Peru', code: 'PE', ddi: '+51' },
  { name: 'Uruguai', code: 'UY', ddi: '+598' },
  { name: 'Venezuela', code: 'VE', ddi: '+58' },
].sort((a, b) => a.name.localeCompare(b.name));

interface PhoneInputProps {
  form: UseFormReturn<any>;
}

export const PhoneInput = ({ form }: PhoneInputProps) => {
  return (
    <div className="space-y-1">
      <div className={formRow}>
        <FormField
          control={form.control}
          name="ddi"
          render={({ field }) => (
            <FormItem className="w-28">
              <FormLabel className="text-gray-700">País</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || '+55'}
                >
                  <SelectTrigger className="bg-white text-gray-900">
                    <SelectValue placeholder="País" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {countries.map((country) => (
                      <SelectItem 
                        key={country.code} 
                        value={country.ddi}
                        className="flex items-center gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <Flag className="h-4 w-4" />
                          <span>{country.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex-shrink-0 w-20">
          <FormLabel className="block mb-2 text-gray-700">Código</FormLabel>
          <div className="text-gray-700 flex items-center h-10 px-3 border border-gray-300 rounded-md bg-white">
            {form.watch('ddi') || '+55'}
          </div>
        </div>

        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormLabel className="text-left w-full text-gray-700">Telefone</FormLabel>
              <FormControl>
                <InputMask
                  mask="(99) 99999-9999"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                >
                  {(inputProps: any) => (
                    <Input
                      {...inputProps}
                      type="tel"
                      placeholder="(XX) XXXXX-XXXX"
                      className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary bg-white text-gray-900"
                    />
                  )}
                </InputMask>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
