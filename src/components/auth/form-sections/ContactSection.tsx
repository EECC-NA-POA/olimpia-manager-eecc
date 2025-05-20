
import React, { useState, useEffect, useCallback } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from 'react-hook-form';
import { PhoneInput } from './phone/PhoneInput';
import { useQuery } from '@tanstack/react-query';
import { fetchBranchesByState } from '@/lib/api';
import { formRow, formColumn } from '@/lib/utils/form-layout';
import { toast } from "sonner";
import { ErrorState } from '@/components/dashboard/components/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';

interface ContactSectionProps {
  form: UseFormReturn<any>;
  hideEmail?: boolean;
  branches?: any[];
  isLoadingBranches?: boolean;
}

export const ContactSection = ({ 
  form, 
  hideEmail,
  branches: propBranches,
  isLoadingBranches: propIsLoadingBranches
}: ContactSectionProps) => {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [statesList, setStatesList] = useState<string[]>([]);
  const [branchesMap, setBranchesMap] = useState<Record<string, any[]>>({});

  const { 
    data: branchesByState = [], 
    isLoading: isLoadingBranchData,
    error: branchesError,
    refetch: refetchBranches
  } = useQuery({
    queryKey: ['branches-by-state'],
    queryFn: fetchBranchesByState,
    retry: 3,
    retryDelay: 1000,
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: false
  });

  // Process branch data and set states list and branches map
  useEffect(() => {
    if (branchesByState && branchesByState.length > 0) {
      console.log('Setting states from data:', branchesByState.length, 'state groups');
      // Extract states list
      const states = branchesByState.map(group => group.estado);
      setStatesList(states);
      
      // Create a map of state -> branches
      const branchMap: Record<string, any[]> = {};
      branchesByState.forEach(group => {
        branchMap[group.estado] = group.branches;
      });
      setBranchesMap(branchMap);
    } else {
      console.log('No branches by state data available');
      setStatesList([]);
      setBranchesMap({});
    }
  }, [branchesByState]);

  const isLoadingBranches = propIsLoadingBranches || isLoadingBranchData;
  
  // Get branches for the selected state
  const branchesForSelectedState = selectedState && branchesMap[selectedState] ? branchesMap[selectedState] : [];

  // Clear branch selection when state changes
  const handleStateChange = (state: string) => {
    setSelectedState(state);
    form.setValue('branchId', undefined);
    form.setValue('state', state);
  };

  // Handle retry when error occurs
  const handleRetry = useCallback(() => {
    console.log('Manually retrying branch fetch...');
    refetchBranches();
  }, [refetchBranches]);

  return (
    <div className="space-y-4">
      {!hideEmail && (
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-left w-full">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <PhoneInput form={form} />

      {/* State and Branch on the same row */}
      <div className={formRow}>
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem className={formColumn}>
              <FormLabel>Estado</FormLabel>
              {isLoadingBranches ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : branchesError ? (
                <Select
                  onValueChange={(value) => {
                    handleStateChange(value);
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
                    handleStateChange(value);
                  }}
                  value={field.value || ''}
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

        <FormField
          control={form.control}
          name="branchId"
          render={({ field }) => (
            <FormItem className={formColumn}>
              <FormLabel>Sede</FormLabel>
              {isLoadingBranches ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : branchesError ? (
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
                        ? (branchesForSelectedState.length > 0 ? "Selecione sua Sede" : "Nenhuma sede encontrada") 
                        : "Selecione um Estado primeiro"} 
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white max-h-[300px]">
                    {branchesForSelectedState.length > 0 ? (
                      branchesForSelectedState.map((branch) => (
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
      </div>

      {branchesError && (
        <div className="mt-2 p-4 border border-red-200 rounded-md bg-red-50">
          <ErrorState 
            onRetry={handleRetry}
            message="Não foi possível carregar os estados e sedes."
          />
        </div>
      )}
    </div>
  );
};
