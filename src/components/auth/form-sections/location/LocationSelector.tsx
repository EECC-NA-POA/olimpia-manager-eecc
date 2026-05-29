
import React, { useCallback, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { formRow } from '@/lib/utils/form-layout';
import { CountrySelector } from './CountrySelector';
import { StateSelector } from './StateSelector';
import { BranchSelector } from './BranchSelector';
import { BranchSelectionError } from './BranchSelectionError';
import { useLocationSelection } from '@/hooks/useLocationSelection';

interface LocationSelectorProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
  context?: string;
}

export const LocationSelector = ({ form, disabled = false, context = 'default' }: LocationSelectorProps) => {
  const {
    countries,
    states,
    branches,
    selectedCountry,
    selectedState,
    setSelectedCountry,
    setSelectedState,
    isLoading,
    error
  } = useLocationSelection('Brasil');

  // Sync form values with hook state
  useEffect(() => {
    if (selectedCountry) {
      form.setValue('country', selectedCountry);
    }
  }, [selectedCountry, form]);

  useEffect(() => {
    if (selectedState) {
      form.setValue('state', selectedState);
    }
  }, [selectedState, form]);

  const handleCountryChange = useCallback((country: string) => {
    setSelectedCountry(country);
    form.setValue('state', '');
    form.setValue('branchId', '');
  }, [form, setSelectedCountry]);

  const handleStateChange = useCallback((state: string) => {
    setSelectedState(state);
    form.setValue('branchId', '');
  }, [form, setSelectedState]);

  // Handle retry when error occurs
  const handleRetry = useCallback(() => {
    console.log('Manually retrying branch fetch...');
    // The useQuery will handle retry automatically
    window.location.reload();
  }, []);

  // Map branches to the format expected by BranchSelector
  const branchesForSelector = branches.map(b => ({
    id: b.id,
    nome: b.nome,
    cidade: b.cidade,
    estado: b.estado
  }));

  return (
    <>
      {/* Country Selector - Full width on its own row */}
      <div className={formRow}>
        <CountrySelector
          form={form}
          countriesList={countries}
          isLoading={isLoading}
          hasError={!!error}
          onCountryChange={handleCountryChange}
          disabled={disabled}
        />
      </div>

      {/* State and Branch Selectors */}
      <div className={formRow}>
        <StateSelector
          form={form}
          statesList={states}
          isLoading={isLoading}
          hasError={!!error}
          onStateChange={handleStateChange}
          disabled={disabled || !selectedCountry}
        />

        <BranchSelector
          form={form}
          branches={branchesForSelector}
          isLoading={isLoading}
          hasError={!!error}
          selectedState={selectedState}
          disabled={disabled || !selectedState}
        />
      </div>

      {error && <BranchSelectionError onRetry={handleRetry} />}
    </>
  );
};
