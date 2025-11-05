
import React, { useState } from 'react';
import { formatToCurrency } from '@/utils/formatters';
import { Button } from "@/components/ui/button";
import { PaymentAmountField } from './PaymentAmountField';
import { Check } from 'lucide-react';

interface PaymentStatusControlsProps {
  onPaymentStatusChange: (status: string) => void;
  value: string;
  disabled: boolean;
  isUpdating: boolean;
  onInputChange: (value: string) => void;
  onSave: () => void;
  onBlur: () => void;
  readOnly?: boolean;
  currentStatus?: string;
}

export const PaymentStatusControls: React.FC<PaymentStatusControlsProps> = ({
  onPaymentStatusChange,
  value,
  disabled,
  isUpdating,
  onInputChange,
  onSave,
  onBlur,
  readOnly,
  currentStatus
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus || '');

  // Update selectedStatus when currentStatus changes
  React.useEffect(() => {
    if (currentStatus) {
      setSelectedStatus(currentStatus);
    }
  }, [currentStatus]);

  const handleStatusClick = (status: string) => {
    if (disabled || readOnly) return;
    setSelectedStatus(status);
    onPaymentStatusChange(status);
  };

  const statusButtons = [
    { 
      value: 'pendente', 
      label: 'Pendente', 
      bgColor: 'bg-yellow-500 hover:bg-yellow-600',
      bgColorSelected: 'bg-yellow-600',
      textColor: 'text-white',
      ringColor: 'ring-yellow-500'
    },
    { 
      value: 'confirmado', 
      label: 'Confirmado', 
      bgColor: 'bg-green-500 hover:bg-green-600',
      bgColorSelected: 'bg-green-600',
      textColor: 'text-white',
      ringColor: 'ring-green-500'
    },
    { 
      value: 'cancelado', 
      label: 'Cancelado', 
      bgColor: 'bg-red-500 hover:bg-red-600',
      bgColorSelected: 'bg-red-600',
      textColor: 'text-white',
      ringColor: 'ring-red-500'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Status do pagamento:</label>
        <div className="flex gap-2">
          {statusButtons.map((status) => {
            const isSelected = selectedStatus === status.value;
            return (
              <Button
                key={status.value}
                onClick={() => handleStatusClick(status.value)}
                disabled={disabled || !!readOnly}
                className={`
                  flex-1 relative font-semibold
                  ${isSelected ? status.bgColorSelected : status.bgColor} 
                  ${status.textColor}
                  ${isSelected ? `ring-4 ${status.ringColor} ring-offset-2 scale-105 shadow-lg` : ''}
                  ${disabled || readOnly ? 'opacity-50 cursor-not-allowed' : ''}
                  transition-all duration-200
                `}
                variant="default"
              >
                {isSelected && <Check className="h-5 w-5 mr-1 font-bold" />}
                {status.label}
              </Button>
            );
          })}
        </div>
      </div>
      <PaymentAmountField
        value={value}
        disabled={disabled || !!readOnly}
        isUpdating={isUpdating}
        onInputChange={onInputChange}
        onSave={onSave}
        onBlur={onBlur}
      />
    </div>
  );
};
