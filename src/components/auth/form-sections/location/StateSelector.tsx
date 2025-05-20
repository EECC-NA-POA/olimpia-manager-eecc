
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from 'react-hook-form';
import { Skeleton } from '@/components/ui/skeleton';

interface StateSelectorProps {
  form: UseFormReturn<any>;
  statesList: string[];
  isLoading: boolean;
  hasError: boolean;
  onStateChange: (state: string) => void;
  disabled?: boolean;
}

export const StateSelector = ({ 
  form, 
  statesList,
  isLoading,
  hasError,
  onStateChange,
  disabled = false
}: StateSelectorProps) => {
  return (
    <FormField
      control={form.control}
      name="state"
      render={({ field }) => (
        <FormItem className="flex flex-col flex-1 min-w-[200px]">
          <FormLabel>Estado</FormLabel>
          {isLoading ? (
            <Skeleton className="h-10 w-full rounded-md" />
          ) : hasError ? (
            <Select
              onValueChange={(value) => {
                onStateChange(value);
                field.onChange(value);
              }}
              value={field.value || ''}
              disabled={true}
            >
              <FormControl>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Erro ao carregar estados" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white max-h-[300px]">
                <SelectItem value="error" disabled>
                  Erro ao carregar estados
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Select
              onValueChange={(value) => {
                onStateChange(value);
                field.onChange(value);
              }}
              value={field.value || ''}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione um Estado" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white max-h-[300px]">
                {statesList.length > 0 ? (
                  statesList.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-states" disabled>
                    Nenhum estado encontrado
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
