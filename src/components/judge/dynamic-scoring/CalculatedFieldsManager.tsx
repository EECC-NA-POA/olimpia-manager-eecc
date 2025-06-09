
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CalculatedFieldCard } from './calculated-fields/CalculatedFieldCard';
import { CalculationActions } from './calculated-fields/CalculationActions';
import { EmptyState } from './calculated-fields/EmptyState';
import { useCalculatedFieldsData } from './calculated-fields/useCalculatedFieldsData';
import { useCalculatedFieldsOperations } from './calculated-fields/useCalculatedFieldsOperations';

interface CalculatedFieldsManagerProps {
  modeloId: number;
  modalityId: number;
  eventId: string;
  bateriaId?: number;
  onCalculationComplete?: (results: any[]) => void;
}

export function CalculatedFieldsManager({
  modeloId,
  modalityId,
  eventId,
  bateriaId,
  onCalculationComplete
}: CalculatedFieldsManagerProps) {
  const {
    calculatedFields,
    scores,
    isLoading
  } = useCalculatedFieldsData({
    modeloId,
    modalityId,
    eventId,
    bateriaId
  });

  const {
    isCalculating,
    calculateRankings,
    isError,
    isPending
  } = useCalculatedFieldsOperations({
    modalityId,
    eventId,
    bateriaId,
    onCalculationComplete
  });

  const handleCalculateRankings = () => {
    calculateRankings({ calculatedFields, scores });
  };

  if (isLoading) {
    return <EmptyState isLoading />;
  }

  if (calculatedFields.length === 0) {
    return <EmptyState />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Gerenciar Colocações
          <Badge variant="outline">{calculatedFields.length} campo(s)</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {calculatedFields.map((field) => (
            <CalculatedFieldCard key={field.id} field={field} />
          ))}
        </div>

        <CalculationActions
          scoresCount={scores.length}
          isCalculating={isCalculating}
          isPending={isPending}
          onCalculate={handleCalculateRankings}
          hasError={isError}
        />
      </CardContent>
    </Card>
  );
}
