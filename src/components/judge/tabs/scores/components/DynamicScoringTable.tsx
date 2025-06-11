
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Athlete } from '../hooks/useAthletes';
import { useDynamicScoringTableState } from './dynamic-scoring-table/useDynamicScoringTableState';
import { UnsavedChangesBanner } from './dynamic-scoring-table/UnsavedChangesBanner';
import { DynamicInputField } from './dynamic-scoring-table/DynamicInputField';
import { AthleteStatusCell } from './dynamic-scoring-table/AthleteStatusCell';
import { usePlacementCalculation } from '@/hooks/usePlacementCalculation';
import { 
  filterScoringFields, 
  filterCalculatedFields,
  filterManualFields,
  modelUsesBaterias 
} from '@/utils/dynamicScoringUtils';

interface DynamicScoringTableProps {
  athletes: Athlete[];
  modalityId: number;
  eventId: string;
  judgeId: string;
  modelo: any;
  selectedBateriaId?: number | null;
}

export function DynamicScoringTable({
  athletes,
  modalityId,
  eventId,
  judgeId,
  modelo,
  selectedBateriaId
}: DynamicScoringTableProps) {
  // Fetch all campos for this modelo
  const { data: allCampos = [], isLoading: isLoadingCampos } = useQuery({
    queryKey: ['campos-modelo', modelo.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campos_modelo')
        .select('*')
        .eq('modelo_id', modelo.id)
        .order('ordem_exibicao');

      if (error) throw error;
      return data;
    },
    enabled: !!modelo.id,
  });

  // Separar campos por tipo
  const allScoringFields = filterScoringFields(allCampos);
  const manualFields = filterManualFields(allCampos);
  const calculatedFields = filterCalculatedFields(allCampos);
  const usesBaterias = modelUsesBaterias(allCampos);

  // Hook para cálculos de colocação
  const {
    isCalculating,
    needsRecalculation,
    calculatePlacements,
    markNeedsRecalculation
  } = usePlacementCalculation({
    modalityId,
    eventId,
    judgeId,
    modeloId: modelo.id,
    bateriaId: selectedBateriaId || undefined
  });

  const {
    scoreData,
    unsavedChanges,
    dynamicSubmission,
    handleFieldChange,
    saveAthleteScore,
    saveAllScores,
    getAthleteCompletionStatus
  } = useDynamicScoringTableState({
    athletes,
    modalityId,
    eventId,
    judgeId,
    modelo,
    selectedBateriaId,
    campos: allScoringFields
  });

  // Modificar handleFieldChange para detectar mudanças que afetam cálculos
  const handleFieldChangeWithRecalculation = (athleteId: string, fieldKey: string, value: string | number) => {
    handleFieldChange(athleteId, fieldKey, value);
    
    // Verificar se algum campo calculado depende deste campo
    calculatedFields.forEach(calculatedField => {
      if (calculatedField.metadados?.campo_referencia === fieldKey) {
        markNeedsRecalculation(calculatedField.chave_campo);
      }
    });
  };

  const handleCalculateField = async (fieldKey: string) => {
    const campo = calculatedFields.find(c => c.chave_campo === fieldKey);
    if (!campo) return;

    // Preparar dados dos atletas para cálculo
    const athleteScores: Record<string, any> = {};
    athletes.forEach(athlete => {
      athleteScores[athlete.atleta_id] = {
        athleteName: athlete.atleta_nome,
        ...scoreData[athlete.atleta_id]
      };
    });

    await calculatePlacements(campo, athleteScores);
  };

  if (isLoadingCampos) {
    return <div>Carregando campos...</div>;
  }

  if (allScoringFields.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Nenhum campo de pontuação configurado</h3>
          <p className="text-sm">
            Este modelo possui apenas campos de configuração. 
            Configure campos de pontuação no painel de administração.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
          <p className="text-sm">
            <strong>Modelo atual:</strong> {modelo.descricao || modelo.codigo_modelo}
          </p>
          {usesBaterias && (
            <p className="text-xs mt-1">
              <strong>Sistema de baterias:</strong> Ativo
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UnsavedChangesBanner
        unsavedCount={unsavedChanges.size}
        onSaveAll={saveAllScores}
        isSaving={dynamicSubmission.isPending}
      />

      {/* Alertas para campos calculados */}
      {needsRecalculation.size > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Recálculo necessário para campos calculados
            </span>
          </div>
          <div className="text-orange-700 text-xs mt-1">
            Dados foram alterados. Use os botões de calculadora para recalcular as colocações.
          </div>
        </div>
      )}

      {usesBaterias && selectedBateriaId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-blue-800 text-sm font-medium">
            Sistema de Baterias Ativo - Bateria {selectedBateriaId}
          </div>
          <div className="text-blue-700 text-xs mt-1">
            Pontuações serão registradas para a bateria selecionada
          </div>
        </div>
      )}

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px] sticky left-0 bg-background">Atleta</TableHead>
              <TableHead className="min-w-[150px]">Filial</TableHead>
              {allScoringFields.map((campo) => (
                <TableHead key={campo.chave_campo} className="min-w-[120px]">
                  <div className="flex flex-col">
                    <span>{campo.rotulo_campo}</span>
                    {campo.obrigatorio && (
                      <Badge variant="outline" className="text-xs w-fit">
                        Obrigatório
                      </Badge>
                    )}
                    {campo.tipo_input === 'calculated' && (
                      <Badge variant="outline" className="text-xs w-fit bg-blue-50 text-blue-700">
                        Calculado
                      </Badge>
                    )}
                    {campo.metadados?.formato_resultado && (
                      <Badge variant="outline" className="text-xs w-fit bg-green-50">
                        {campo.metadados.formato_resultado === 'tempo' ? 'Tempo' :
                         campo.metadados.formato_resultado === 'distancia' ? 'Distância' : 'Pontos'}
                      </Badge>
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {athletes.map((athlete) => {
              const status = getAthleteCompletionStatus(athlete.atleta_id);
              const hasUnsavedChanges = unsavedChanges.has(athlete.atleta_id);

              return (
                <TableRow key={athlete.atleta_id}>
                  <TableCell className="font-medium sticky left-0 bg-background">
                    {athlete.atleta_nome}
                  </TableCell>
                  <TableCell>
                    {athlete.filial_nome || '-'}
                  </TableCell>
                  {allScoringFields.map((campo) => (
                    <TableCell key={campo.chave_campo}>
                      <DynamicInputField
                        campo={campo}
                        athleteId={athlete.atleta_id}
                        value={scoreData[athlete.atleta_id]?.[campo.chave_campo] || ''}
                        onChange={handleFieldChangeWithRecalculation}
                        needsRecalculation={needsRecalculation.has(campo.chave_campo)}
                        onCalculateField={handleCalculateField}
                        isCalculating={isCalculating}
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <AthleteStatusCell
                      athleteId={athlete.atleta_id}
                      athleteName={athlete.atleta_nome}
                      completionStatus={status}
                      hasUnsavedChanges={hasUnsavedChanges}
                      onSave={saveAthleteScore}
                      isSaving={dynamicSubmission.isPending}
                    />
                  </TableCell>
                  <TableCell>
                    {/* Ações específicas do atleta podem ser adicionadas aqui */}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Botões de ação para campos calculados */}
      {calculatedFields.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Cálculos Disponíveis</h4>
          <div className="flex flex-wrap gap-2">
            {calculatedFields.map(campo => (
              <Button
                key={campo.chave_campo}
                variant="outline"
                size="sm"
                onClick={() => handleCalculateField(campo.chave_campo)}
                disabled={isCalculating}
                className={needsRecalculation.has(campo.chave_campo) ? 'border-orange-300 bg-orange-50' : ''}
              >
                <Calculator className="h-3 w-3 mr-1" />
                {campo.rotulo_campo}
                {needsRecalculation.has(campo.chave_campo) && (
                  <AlertTriangle className="h-3 w-3 ml-1 text-orange-600" />
                )}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
