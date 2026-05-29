
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from 'react-hook-form';
import { Skeleton } from '@/components/ui/skeleton';

interface CountrySelectorProps {
  form: UseFormReturn<any>;
  countriesList: string[];
  isLoading: boolean;
  hasError: boolean;
  onCountryChange: (country: string) => void;
  disabled?: boolean;
}

export const CountrySelector = ({
  form,
  countriesList,
  isLoading,
  hasError,
  onCountryChange,
  disabled = false
}: CountrySelectorProps) => {
  return (
    <FormField
      control={form.control}
      name="country"
      render={({ field }) => (
        <FormItem className="flex flex-col flex-1 min-w-[200px]">
          <FormLabel className="text-gray-700">País</FormLabel>
          {isLoading ? (
            <Skeleton className="h-10 w-full rounded-md" />
          ) : hasError ? (
            <Select
              onValueChange={(value) => {
                onCountryChange(value);
                field.onChange(value);
              }}
              value={field.value || 'Brasil'}
              disabled={true}
            >
              <FormControl>
                <SelectTrigger className="bg-white text-gray-900">
                  <SelectValue placeholder="Erro ao carregar países" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white max-h-[300px]">
                <SelectItem value="error" disabled>
                  Erro ao carregar países
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Select
              onValueChange={(value) => {
                onCountryChange(value);
                field.onChange(value);
              }}
              value={field.value || 'Brasil'}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger className="bg-white text-gray-900">
                  <SelectValue placeholder="Selecione um País" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white max-h-[300px]">
                {countriesList.length > 0 ? (
                  countriesList.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="Brasil">
                    Brasil
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
