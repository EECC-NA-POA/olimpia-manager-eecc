
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, AlertTriangle } from 'lucide-react';
import { CampoModelo } from '@/types/dynamicScoring';

interface CalculatedFieldCellProps {
  campo: CampoModelo;
  athleteId: string;
  value: string | number;
  needsRecalculation?: boolean;
  onCalculate?: (fieldKey: string) => void;
  isCalculating?: boolean;
}

export function CalculatedFieldCell({ 
  campo, 
  athleteId, 
  value, 
  needsRecalculation = false,
  onCalculate,
  isCalculating = false 
}: CalculatedFieldCellProps) {
  const displayValue = value || '-';
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        {needsRecalculation ? (
          <div className="flex items-center gap-1 text-orange-600">
            <AlertTriangle className="h-3 w-3" />
            <span className="text-sm">{displayValue}</span>
          </div>
        ) : (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {displayValue}
          </Badge>
        )}
      </div>
      
      {onCalculate && (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => onCalculate(campo.chave_campo)}
          disabled={isCalculating}
          title={needsRecalculation ? "Recalcular necessário" : "Calcular colocação"}
        >
          <Calculator className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
