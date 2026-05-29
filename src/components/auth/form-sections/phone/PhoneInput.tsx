
import React from 'react';
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from 'react-hook-form';
import { formRow } from '@/lib/utils/form-layout';

interface PhoneInputProps {
  form: UseFormReturn<any>;
}

export const PhoneInput = ({ form }: PhoneInputProps) => {
  const handleDDIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d+]/g, ''); // Allow + and numbers
    if (!value.startsWith('+')) {
      value = '+' + value.replace(/\+/g, '');
    }
    // Limit to 4 chars (+ and 3 numbers)
    if (value.length > 4) value = value.slice(0, 4);
    form.setValue('ddi', value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
    form.setValue('telefone', value);
  };

  return (
    <div className="space-y-1">
      <div className={formRow}>
        <FormField
          control={form.control}
          name="ddi"
          render={({ field }) => (
            <FormItem className="w-24">
              <FormLabel className="text-gray-700">DDI</FormLabel>
              <FormControl>
                <Input
                  value={field.value || '+55'}
                  onChange={handleDDIChange}
                  placeholder="+55"
                  maxLength={4}
                  className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary bg-white text-gray-900"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormLabel className="text-left w-full text-gray-700">Telefone</FormLabel>
              <FormControl>
                <Input
                  value={field.value || ''}
                  onChange={handlePhoneChange}
                  type="tel"
                  placeholder="11999999999"
                  maxLength={11}
                  className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary bg-white text-gray-900"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
