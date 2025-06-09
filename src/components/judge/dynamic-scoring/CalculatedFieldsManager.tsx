
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Check, AlertCircle } from 'lucide-react';
import { useCalculatedFields } from '@/hooks/useCalculatedFields';
import { CampoModelo, CalculationResult } from '@/types/dynamicScoring';

interface CalculatedFieldsManagerProps {
  modeloId: number;
  modalityId: number;
  eventId: string;
  bateriaId?: number;
  onCalculationComplete: (results: CalculationResult[]) => void;
}

export function CalculatedFieldsManager({
  modeloId,
  modalityId,
  eventId,
  bateriaId,
  onCalculationComplete
}: CalculatedFieldsManagerProps) {
  const [calculatingField, setCalculatingField] = useState<string | null>(null);
  const [previewResults, setPreviewResults] = useState<CalculationResult[] | null>(null);
  
  const {
    calculatedFields,
    canCalculate,
    calculateField,
    confirmCalculation,
    isCalculating
  } = useCalculatedFields({
    modeloId,
    modalityId,
    eventId,
    bateriaId
  });

  const handleCalculate = async (campo: CampoModelo) => {
    setCalculatingField(campo.chave_campo);
    try {
      const results = await calculateField(campo);
      setPreviewResults(results);
    } catch (error) {
      console.error('Error calculating field:', error);
    } finally {
      setCalculatingField(null);
    }
  };

  const handleConfirm = async () => {
    if (previewResults) {
      await confirmCalculation(previewResults);
      onCalculationComplete(previewResults);
      setPreviewResults(null);
    }
  };

  const handleCancel = () => {
    setPreviewResults(null);
  };

  if (!calculatedFields.length) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Campos Calculados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {calculatedFields.map((campo) => {
          const canCalc = canCalculate(campo);
          const isCurrentlyCalculating = calculatingField === campo.chave_campo;
          
          return (
            <div key={campo.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-sm">{campo.rotulo_campo}</div>
                <div className="text-xs text-muted-foreground">
                  {campo.metadados?.tipo_calculo === 'colocacao_bateria' && 'Colocação na Bateria'}
                  {campo.metadados?.tipo_calculo === 'colocacao_final' && 'Colocação Final'}
                  {campo.metadados?.contexto && ` (${campo.metadados.contexto})`}
                </div>
                {campo.metadados?.campo_referencia && (
                  <div className="text-xs text-blue-600">
                    Baseado em: {campo.metadados.campo_referencia}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {!canCalc && (
                  <Badge variant="secondary" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Aguardando dados
                  </Badge>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!canCalc || isCurrentlyCalculating || isCalculating}
                  onClick={() => handleCalculate(campo)}
                >
                  {isCurrentlyCalculating ? (
                    'Calculando...'
                  ) : (
                    <>
                      <Calculator className="h-3 w-3 mr-1" />
                      Calcular
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}

        {previewResults && (
          <div className="mt-4 p-4 border rounded-lg bg-blue-50">
            <div className="font-medium text-sm mb-2">Preview dos Resultados:</div>
            <div className="space-y-2 mb-4">
              {previewResults.map((result, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>Atleta {result.atleta_id}</span>
                  <span className="font-medium">{result.valor_calculado}ª posição</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleConfirm}>
                <Check className="h-3 w-3 mr-1" />
                Confirmar
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
