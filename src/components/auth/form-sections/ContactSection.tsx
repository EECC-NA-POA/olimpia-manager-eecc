
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from 'react-hook-form';
import { PhoneInput } from './phone/PhoneInput';

interface ContactSectionProps {
  form: UseFormReturn<any>;
  hideEmail?: boolean;
}

export const ContactSection = ({ 
  form, 
  hideEmail
}: ContactSectionProps) => {
  return (
    <div className="space-y-4">
      {!hideEmail && (
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-left w-full text-gray-700">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary bg-white text-gray-900"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <PhoneInput form={form} />
    </div>
  );
};
