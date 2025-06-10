
import React from 'react';
import { ErrorState } from '@/components/dashboard/components/ErrorState';

interface BranchSelectionErrorProps {
  onRetry: () => void;
}

export const BranchSelectionError = ({ onRetry }: BranchSelectionErrorProps) => {
  return (
    <div className="mt-2 p-4 border border-red-200 rounded-md bg-red-50">
      <ErrorState 
        onRetry={onRetry}
        message="Não foi possível carregar os estados e sedes."
      />
    </div>
  );
};
