
import React, { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { formRow } from '@/lib/utils/form-layout';
import { StateSelector } from './StateSelector';
import { BranchSelector } from './BranchSelector';
import { BranchSelectionError } from './BranchSelectionError';
import { useBranchSelection } from './useBranchSelection';

interface LocationSelectorProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
}

export const LocationSelector = ({ form, disabled = false }: LocationSelectorProps) => {
  const {
    statesList,
    branchesForSelectedState,
    selectedState,
    handleStateChange,
    isLoading,
    error,
    refetch
  } = useBranchSelection();

  const handleStateSelectorChange = useCallback((state: string) => {
    handleStateChange(state);
    form.setValue('branchId', undefined);
  }, [form, handleStateChange]);

  // Handle retry when error occurs
  const handleRetry = useCallback(() => {
    console.log('Manually retrying branch fetch...');
    refetch();
  }, [refetch]);

  return (
    <>
      <div className={formRow}>
        <StateSelector 
          form={form}
          statesList={statesList}
          isLoading={isLoading}
          hasError={!!error}
          onStateChange={handleStateSelectorChange}
          disabled={disabled}
        />

        <BranchSelector
          form={form}
          branches={branchesForSelectedState}
          isLoading={isLoading}
          hasError={!!error}
          selectedState={selectedState}
          disabled={disabled}
        />
      </div>

      {error && <BranchSelectionError onRetry={handleRetry} />}
    </>
  );
};
