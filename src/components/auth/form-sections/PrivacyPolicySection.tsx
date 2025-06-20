
import React from 'react';
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from 'react-hook-form';

interface PrivacyPolicySectionProps {
  form: UseFormReturn<any>;
}

export const PrivacyPolicySection = ({ form }: PrivacyPolicySectionProps) => {
  return (
    <FormField
      control={form.control}
      name="acceptPrivacyPolicy"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Aceito a política de privacidade e os termos de uso
            </label>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};
