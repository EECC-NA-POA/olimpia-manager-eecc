
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CalculationResult {
  atleta_id: string;
  chave_campo: string;
  valor_calculado: number;
}

interface AthleteWithParticipation {
  atleta_id: string;
  nome: string;
  participando: boolean;
  hasRequiredFields: boolean;
}

interface CalculationResultsCardProps {
  calculationResults: CalculationResult[];
  athletesWithParticipation: AthleteWithParticipation[];
  isCalculating: boolean;
  onConfirmCalculations: () => void;
  onCancelResults: () => void;
}

export function CalculationResultsCard({
  calculationResults,
  athletesWithParticipation,
  isCalculating,
  onConfirmCalculations,
  onCancelResults
}: CalculationResultsCardProps) {
  if (calculationResults.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados do Cálculo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Revise os resultados antes de confirmar:
        </div>
        
        <div className="space-y-2">
          {calculationResults.map((result, index) => {
            const athlete = athletesWithParticipation.find(a => a.atleta_id === result.atleta_id);
            return (
              <div key={index} className="flex justify-between items-center p-2 border rounded">
                <span>{athlete?.nome || result.atleta_id}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {result.chave_campo}:
                  </span>
                  <Badge variant="outline">
                    {result.valor_calculado}º lugar
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={onConfirmCalculations}
            disabled={isCalculating}
            className="flex-1"
          >
            Confirmar e Salvar Colocações
          </Button>
          <Button
            variant="outline"
            onClick={onCancelResults}
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
