
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from 'react-hook-form';
import { Skeleton } from '@/components/ui/skeleton';

interface BranchSelectorProps {
  form: UseFormReturn<any>;
  branches: any[];
  isLoading: boolean;
  hasError: boolean;
  selectedState: string | null;
}

export const BranchSelector = ({
  form,
  branches,
  isLoading,
  hasError,
  selectedState
}: BranchSelectorProps) => {
  return (
    <FormField
      control={form.control}
      name="branchId"
      render={({ field }) => (
        <FormItem className="flex flex-col flex-1 min-w-[200px]">
          <FormLabel>Sede</FormLabel>
          {isLoading ? (
            <Skeleton className="h-10 w-full rounded-md" />
          ) : hasError ? (
            <Select
              disabled={true}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Erro ao carregar sedes" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white">
                <SelectItem value="error" disabled>
                  Erro ao carregar sedes
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={!selectedState}
            >
              <FormControl>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder={selectedState 
                    ? (branches.length > 0 ? "Selecione sua Sede" : "Nenhuma sede encontrada") 
                    : "Selecione um Estado primeiro"} 
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white max-h-[300px]">
                {branches.length > 0 ? (
                  branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.nome}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-branches" disabled>
                    {selectedState ? "Nenhuma sede encontrada" : "Selecione um Estado primeiro"}
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
