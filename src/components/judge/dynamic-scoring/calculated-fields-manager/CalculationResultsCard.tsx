
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Trophy } from 'lucide-react';

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

  // Group results by field
  const resultsByField = calculationResults.reduce((acc, result) => {
    if (!acc[result.chave_campo]) {
      acc[result.chave_campo] = [];
    }
    acc[result.chave_campo].push(result);
    return acc;
  }, {} as Record<string, CalculationResult[]>);

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Trophy className="h-5 w-5" />
          Resultados do Cálculo de Colocações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-green-700 mb-4">
          Revise os resultados antes de confirmar e salvar:
        </div>
        
        {Object.entries(resultsByField).map(([fieldKey, fieldResults]) => (
          <div key={fieldKey} className="space-y-2">
            <h4 className="font-medium text-green-800 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {fieldKey}
            </h4>
            
            <div className="grid gap-2">
              {fieldResults
                .sort((a, b) => a.valor_calculado - b.valor_calculado)
                .map((result, index) => {
                  const athlete = athletesWithParticipation.find(a => a.atleta_id === result.atleta_id);
                  const position = result.valor_calculado;
                  
                  return (
                    <div key={`${result.atleta_id}-${fieldKey}`} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-bold text-sm">
                          {position}
                        </div>
                        <span className="font-medium">{athlete?.nome || result.atleta_id}</span>
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className={`
                          ${position === 1 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 
                            position === 2 ? 'bg-gray-100 text-gray-800 border-gray-300' :
                            position === 3 ? 'bg-orange-100 text-orange-800 border-orange-300' :
                            'bg-blue-50 text-blue-700 border-blue-200'}
                        `}
                      >
                        {position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '🏅'} {position}º lugar
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
        
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={onConfirmCalculations}
            disabled={isCalculating}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isCalculating ? 'Salvando...' : 'Confirmar e Salvar Colocações'}
          </Button>
          <Button
            variant="outline"
            onClick={onCancelResults}
            disabled={isCalculating}
          >
            Cancelar
          </Button>
        </div>
        
        <div className="text-xs text-green-600 text-center">
          {calculationResults.length} colocação(ões) calculada(s)
        </div>
      </CardContent>
    </Card>
  );
}
