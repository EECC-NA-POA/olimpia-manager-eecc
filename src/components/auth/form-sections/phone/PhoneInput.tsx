
import React from 'react';
import { Flag, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from 'react-hook-form';
import InputMask from 'react-input-mask';

const countries = [
  { name: 'Brasil', code: 'BR', ddi: '+55' },
  { name: 'Argentina', code: 'AR', ddi: '+54' },
  { name: 'Chile', code: 'CL', ddi: '+56' },
  { name: 'Uruguai', code: 'UY', ddi: '+598' },
  { name: 'Paraguai', code: 'PY', ddi: '+595' },
  { name: 'Peru', code: 'PE', ddi: '+51' },
  { name: 'Colômbia', code: 'CO', ddi: '+57' },
  { name: 'Venezuela', code: 'VE', ddi: '+58' },
  { name: 'Equador', code: 'EC', ddi: '+593' },
  { name: 'Bolívia', code: 'BO', ddi: '+591' },
].sort((a, b) => a.name.localeCompare(b.name));

interface PhoneInputProps {
  form: UseFormReturn<any>;
}

export const PhoneInput = ({ form }: PhoneInputProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-end gap-2">
          <FormField
            control={form.control}
            name="ddi"
            render={({ field }) => (
              <FormItem className="flex-shrink-0 w-32">
                <FormLabel>País</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || '+55'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="País" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-background">
                    {countries.map((country) => (
                      <SelectItem 
                        key={country.code} 
                        value={country.ddi}
                        className="flex items-center gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <Flag className="h-4 w-4" />
                          <span>{country.name}</span>
                          <span className="text-muted-foreground">({country.ddi})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex-shrink-0 w-20 text-muted-foreground flex items-center h-10 px-3 border rounded-md">
            {form.watch('ddi') || '+55'}
          </div>

          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel className="text-left w-full">Telefone</FormLabel>
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
      </div>
    </div>
  );
};
