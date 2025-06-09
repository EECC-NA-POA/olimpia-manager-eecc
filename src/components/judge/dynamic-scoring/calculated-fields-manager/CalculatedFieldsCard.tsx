
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Calculator, CheckCircle } from 'lucide-react';

interface CalculatedField {
  chave_campo: string;
  rotulo_campo: string;
  metadados?: {
    tipo_calculo?: string;
    campo_referencia?: string;
  };
}

interface CalculatedFieldsCardProps {
  calculatedFields: CalculatedField[];
  selectedFields: string[];
  canCalculateFields: boolean;
  participatingCount: number;
  isCalculating: boolean;
  onFieldSelection: (fieldKey: string, checked: boolean) => void;
  onCalculateSelected: () => void;
  canCalculate: (field: CalculatedField) => boolean;
}

export function CalculatedFieldsCard({
  calculatedFields,
  selectedFields,
  canCalculateFields,
  participatingCount,
  isCalculating,
  onFieldSelection,
  onCalculateSelected,
  canCalculate
}: CalculatedFieldsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Cálculo de Colocações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canCalculateFields && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">
              {participatingCount <= 1 
                ? 'É necessário pelo menos 2 atletas participando para calcular colocações'
                : 'Alguns atletas ainda não têm todos os campos obrigatórios preenchidos'
              }
            </span>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-medium">Campos Calculados Disponíveis:</h4>
          
          {calculatedFields.map((field) => {
            const fieldCanCalculate = canCalculate(field);
            return (
              <div key={field.chave_campo} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedFields.includes(field.chave_campo)}
                    onCheckedChange={(checked) => 
                      onFieldSelection(field.chave_campo, checked as boolean)
                    }
                    disabled={!canCalculateFields || !fieldCanCalculate}
                  />
                  <div>
                    <span className="font-medium">{field.rotulo_campo}</span>
                    <div className="text-xs text-muted-foreground">
                      Tipo: {field.metadados?.tipo_calculo} | 
                      Referência: {field.metadados?.campo_referencia}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {fieldCanCalculate ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Pronto
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700">
                      Aguardando dados
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onCalculateSelected}
            disabled={!canCalculateFields || selectedFields.length === 0 || isCalculating}
            className="flex-1"
          >
            {isCalculating ? 'Calculando...' : 'Calcular Colocações Selecionadas'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
