
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Calculator, Users, CheckCircle } from 'lucide-react';
import { useCalculatedFields } from '@/hooks/useCalculatedFields';
import { useAthleteParticipation } from './hooks/useAthleteParticipation';
import { CalculationResult } from '@/types/dynamicScoring';
import { toast } from 'sonner';

interface CalculatedFieldsManagerProps {
  modeloId: number;
  modalityId: number;
  eventId: string;
  bateriaId?: number;
}

export function CalculatedFieldsManager({
  modeloId,
  modalityId,
  eventId,
  bateriaId
}: CalculatedFieldsManagerProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [calculationResults, setCalculationResults] = useState<CalculationResult[]>([]);
  const [showResults, setShowResults] = useState(false);

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

  const {
    athletesWithParticipation,
    toggleAthleteParticipation,
    getParticipatingAthletes,
    allRequiredFieldsCompleted,
    isLoadingParticipation
  } = useAthleteParticipation({
    modalityId,
    eventId,
    bateriaId,
    modeloId
  });

  if (calculatedFields.length === 0) {
    return null; // No calculated fields configured
  }

  const handleFieldSelection = (fieldKey: string, checked: boolean) => {
    if (checked) {
      setSelectedFields(prev => [...prev, fieldKey]);
    } else {
      setSelectedFields(prev => prev.filter(key => key !== fieldKey));
    }
  };

  const handleCalculateSelected = async () => {
    if (selectedFields.length === 0) {
      toast.error('Selecione pelo menos um campo para calcular');
      return;
    }

    try {
      const results: CalculationResult[] = [];
      
      for (const fieldKey of selectedFields) {
        const field = calculatedFields.find(f => f.chave_campo === fieldKey);
        if (field && canCalculate(field)) {
          const fieldResults = await calculateField(field);
          results.push(...fieldResults);
        }
      }
      
      setCalculationResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Error calculating fields:', error);
      toast.error('Erro ao calcular campos');
    }
  };

  const handleConfirmCalculations = async () => {
    try {
      await confirmCalculation(calculationResults);
      setCalculationResults([]);
      setShowResults(false);
      setSelectedFields([]);
      toast.success('Colocações calculadas e salvas com sucesso!');
    } catch (error) {
      console.error('Error confirming calculations:', error);
      toast.error('Erro ao salvar cálculos');
    }
  };

  const participatingAthletes = getParticipatingAthletes();
  const canCalculateFields = allRequiredFieldsCompleted && participatingAthletes.length > 1;

  return (
    <div className="space-y-6">
      {/* Athletes Participation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Status de Participação dos Atletas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingParticipation ? (
            <div>Carregando...</div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Total de atletas: {athletesWithParticipation.length}</span>
                <span>Participando: {participatingAthletes.length}</span>
                <span>Não participando: {athletesWithParticipation.length - participatingAthletes.length}</span>
              </div>
              
              <div className="grid gap-2">
                {athletesWithParticipation.map((athlete) => (
                  <div key={athlete.atleta_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={athlete.participando}
                        onCheckedChange={(checked) => 
                          toggleAthleteParticipation(athlete.atleta_id, checked as boolean)
                        }
                      />
                      <span className="font-medium">{athlete.nome}</span>
                      {athlete.hasRequiredFields ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Dados completos
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          Dados incompletos
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {athlete.participando ? 'Participando' : 'Não participará'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calculated Fields Management */}
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
                {participatingAthletes.length <= 1 
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
                        handleFieldSelection(field.chave_campo, checked as boolean)
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
              onClick={handleCalculateSelected}
              disabled={!canCalculateFields || selectedFields.length === 0 || isCalculating}
              className="flex-1"
            >
              {isCalculating ? 'Calculando...' : 'Calcular Colocações Selecionadas'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Results */}
      {showResults && calculationResults.length > 0 && (
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
                onClick={handleConfirmCalculations}
                disabled={isCalculating}
                className="flex-1"
              >
                Confirmar e Salvar Colocações
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowResults(false);
                  setCalculationResults([]);
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
