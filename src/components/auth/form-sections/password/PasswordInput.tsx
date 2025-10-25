
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

interface PasswordInputProps {
  form: UseFormReturn<any>;
  name: 'password' | 'confirmPassword';
  label: string;
}

export const PasswordInput = ({ form, name, label }: PasswordInputProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-left w-full text-gray-700">{label}</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder="••••••"
              className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary bg-white text-gray-900"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
