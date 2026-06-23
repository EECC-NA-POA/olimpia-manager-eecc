
import React, { useCallback, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { formRow } from '@/lib/utils/form-layout';
import { CountrySelector } from './CountrySelector';
import { StateSelector } from './StateSelector';
import { BranchSelector } from './BranchSelector';
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
    isFetching,
  } = useLocationSelection('Brasil');

  // Mantém skeleton enquanto carregando, retentando, OU em erro (servidor fora do ar).
  // Campos em branco sem opções confundem o usuário — skeleton + toast é mais claro.
  const loading = isLoading || isFetching || !!error;

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

  const branchesForSelector = branches.map(b => ({
    id: b.id,
    nome: b.nome,
    cidade: b.cidade,
    estado: b.estado,
  }));

  return (
    <>
      <div className={formRow}>
        <CountrySelector
          form={form}
          countriesList={countries}
          isLoading={loading}
          hasError={false}
          onCountryChange={handleCountryChange}
          disabled={disabled}
        />
      </div>

      <div className={formRow}>
        <StateSelector
          form={form}
          statesList={states}
          isLoading={loading}
          hasError={false}
          onStateChange={handleStateChange}
          disabled={disabled || !selectedCountry}
        />

        <BranchSelector
          form={form}
          branches={branchesForSelector}
          isLoading={loading}
          hasError={false}
          selectedState={selectedState}
          disabled={disabled || !selectedState}
        />
      </div>
      {/* BranchSelectionError removido — erros de rede são tratados via toast
          e retry automático; o formulário nunca bloqueia o usuário */}
    </>
  );
};
