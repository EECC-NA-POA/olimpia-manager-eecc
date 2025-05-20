
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from 'react-hook-form';
import { PhoneInput } from './phone/PhoneInput';
import { useQuery } from '@tanstack/react-query';
import { fetchBranchesByState } from '@/lib/api';
import { formRow, formColumn } from '@/lib/utils/form-layout';

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

  const { data: branchesByState = [], isLoading: isLoadingBranchData } = useQuery({
    queryKey: ['branches-by-state'],
    queryFn: fetchBranchesByState,
    retry: 3,
    retryDelay: 1000,
    staleTime: 60000, // Cache for 1 minute
  });

  useEffect(() => {
    if (branchesByState && branchesByState.length > 0) {
      console.log('Setting states from data:', branchesByState);
      // Extract states list
      const states = branchesByState.map(group => group.estado);
      setStatesList(states);
      
      // Create a map of state -> branches
      const branchMap: Record<string, any[]> = {};
      branchesByState.forEach(group => {
        branchMap[group.estado] = group.branches;
      });
      setBranchesMap(branchMap);
      
      console.log('States list:', states);
      console.log('Branches map:', branchMap);
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
              <Select
                onValueChange={(value) => {
                  handleStateChange(value);
                }}
                value={field.value || ''}
                disabled={isLoadingBranches || statesList.length === 0}
              >
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={isLoadingBranches ? "Carregando estados..." : "Selecione um Estado"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  {statesList.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedState || isLoadingBranches || branchesForSelectedState.length === 0}
              >
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={selectedState 
                      ? (branchesForSelectedState.length > 0 ? "Selecione sua Sede" : "Nenhuma sede encontrada") 
                      : "Selecione um Estado primeiro"} 
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  {branchesForSelectedState.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
