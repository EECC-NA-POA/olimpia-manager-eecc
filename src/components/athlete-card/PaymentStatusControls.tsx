
import React from 'react';
import { formatToCurrency } from '@/utils/formatters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentAmountField } from './PaymentAmountField';

interface PaymentStatusControlsProps {
  onPaymentStatusChange: (status: string) => void;
  value: string;
  disabled: boolean;
  isUpdating: boolean;
  onInputChange: (value: string) => void;
  onSave: () => void;
  onBlur: () => void;
  readOnly?: boolean;
}

export const PaymentStatusControls: React.FC<PaymentStatusControlsProps> = ({
  onPaymentStatusChange,
  value,
  disabled,
  isUpdating,
  onInputChange,
  onSave,
  onBlur,
  readOnly
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Status do pagamento:</label>
        <Select onValueChange={onPaymentStatusChange} disabled={disabled || !!readOnly}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alterar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
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
