
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Info, AlertCircle } from 'lucide-react';

interface CalculationActionsProps {
  scoresCount: number;
  isCalculating: boolean;
  isPending: boolean;
  onCalculate: () => void;
  hasError: boolean;
}

export function CalculationActions({
  scoresCount,
  isCalculating,
  isPending,
  onCalculate,
  hasError
}: CalculationActionsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Info className="h-4 w-4" />
        <span>{scoresCount} pontuação(ões) encontrada(s) para cálculo</span>
      </div>
      
      {scoresCount === 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span>Nenhuma pontuação encontrada. Registre pontuações primeiro antes de calcular colocações.</span>
        </div>
      )}

      <Button
        onClick={onCalculate}
        disabled={isCalculating || isPending || scoresCount === 0}
        className="w-full"
        size="lg"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
        {isCalculating ? 'Calculando Colocações...' : 'Calcular Colocações'}
      </Button>

      {hasError && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          Erro ao calcular colocações. Verifique os logs do console para mais detalhes.
        </div>
      )}
    </div>
  );
}
