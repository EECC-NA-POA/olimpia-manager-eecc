
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";

interface ExemptionCheckboxProps {
  isCurrentUser: boolean;
  isExempt: boolean;
  isUpdatingExemption: boolean;
  onExemptionChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const ExemptionCheckbox: React.FC<ExemptionCheckboxProps> = ({
  isCurrentUser,
  isExempt,
  isUpdatingExemption,
  onExemptionChange,
  disabled
}) => {
  if (!isCurrentUser) return null;

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="exempt-checkbox"
          checked={isExempt}
          onCheckedChange={onExemptionChange}
          disabled={isUpdatingExemption || !!disabled}
        />
        <label htmlFor="exempt-checkbox" className="text-sm font-medium text-blue-700">
          Marcar como isento (valor do pagamento será zerado)
        </label>
        {isUpdatingExemption && (
          <div className="text-xs text-blue-600">Atualizando...</div>
        )}
      </div>
      {isExempt && (
        <div className="mt-2 text-xs text-blue-600">
          ✓ Você está marcado como isento deste evento
        </div>
      )}
    </div>
  );
};
