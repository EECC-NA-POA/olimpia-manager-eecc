import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, RefreshCw } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Athlete } from '../hooks/useAthletes';
import { useDynamicScoringTableState } from './dynamic-scoring-table/useDynamicScoringTableState';
import { UnsavedChangesBanner } from './dynamic-scoring-table/UnsavedChangesBanner';
import { DynamicInputField } from './dynamic-scoring-table/DynamicInputField';
import { AthleteStatusCell } from './dynamic-scoring-table/AthleteStatusCell';
import { useBatchPlacementCalculation } from '@/hooks/useBatchPlacementCalculation';
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
  const queryClient = useQueryClient();
  console.log('DynamicScoringTable - Renderizando com:', {
    athletesCount: athletes.length,
    modalityId,
    modeloId: modelo?.id,
    selectedBateriaId
  });

  // Fetch all campos for this modelo
  const { data: allCampos = [], isLoading: isLoadingCampos } = useQuery({
    queryKey: ['campos-modelo', modelo.id],
    queryFn: async () => {
      console.log('Buscando campos para modelo:', modelo.id);
      
      const { data, error } = await supabase
        .from('campos_modelo')
        .select('*')
        .eq('modelo_id', modelo.id)
        .order('ordem_exibicao');

      if (error) {
        console.error('Erro ao buscar campos:', error);
        throw error;
      }
      
      console.log('Campos encontrados:', data?.length || 0);
      console.log('Detalhes dos campos:', data?.map(c => ({ chave: c.chave_campo, rotulo: c.rotulo_campo, tipo: c.tipo_input })));
      return data;
    },
    enabled: !!modelo.id,
  });

  // Separar campos por tipo
  const allScoringFields = filterScoringFields(allCampos);
  const manualFields = filterManualFields(allCampos);
  const calculatedFields = filterCalculatedFields(allCampos);
  const usesBaterias = modelUsesBaterias(allCampos);

  console.log('DynamicScoringTable - Campos separados:', {
    total: allCampos.length,
    scoring: allScoringFields.length,
    manual: manualFields.length,
    calculated: calculatedFields.length,
    usesBaterias
  });

  // Hook para cálculos de colocação em lote
  const {
    isCalculating,
    calculateBatchPlacements
  } = useBatchPlacementCalculation({
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

  const handleCalculateBatchPlacements = async (fieldKey: string) => {
    console.log('Calculando colocações para campo:', fieldKey);
    
    const campo = calculatedFields.find(c => c.chave_campo === fieldKey);
    if (!campo) {
      console.error('Campo calculado não encontrado:', fieldKey);
      return;
    }

    console.log('Campo encontrado:', campo);

    // Preparar dados dos atletas para cálculo
    const athleteScores: Record<string, any> = {};
    athletes.forEach(athlete => {
      athleteScores[athlete.atleta_id] = {
        athleteName: athlete.atleta_nome,
        ...scoreData[athlete.atleta_id]
      };
    });

    console.log('Dados preparados para cálculo:', athleteScores);

    await calculateBatchPlacements(campo, athleteScores);
    
    // Após o cálculo, forçar um refresh manual dos dados
    console.log('Forçando refresh dos dados após cálculo...');
    setTimeout(() => {
      queryClient.invalidateQueries({ 
        queryKey: ['athlete-dynamic-scores', modalityId, eventId, modelo.id, selectedBateriaId] 
      });
    }, 1000);
  };

  const handleRefreshData = () => {
    console.log('Atualizando dados da tabela...');
    queryClient.invalidateQueries({ 
      queryKey: ['athlete-dynamic-scores', modalityId, eventId, modelo.id, selectedBateriaId] 
    });
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

      {/* Botão para atualizar dados */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshData}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-3 w-3" />
          Atualizar Dados
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px] sticky left-0 bg-background">Atleta</TableHead>
              <TableHead className="min-w-[150px]">Filial</TableHead>
              {usesBaterias && (
                <TableHead className="min-w-[100px]">Bateria</TableHead>
              )}
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
                  </div>
                </TableHead>
              ))}
              <TableHead className="min-w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {athletes.map((athlete) => {
              const status = getAthleteCompletionStatus(athlete.atleta_id);
              const hasUnsavedChanges = unsavedChanges.has(athlete.atleta_id);
              const athleteBateriaId = scoreData[athlete.atleta_id]?.bateria || selectedBateriaId;

              return (
                <TableRow key={athlete.atleta_id}>
                  <TableCell className="font-medium sticky left-0 bg-background">
                    {athlete.atleta_nome}
                  </TableCell>
                  <TableCell>
                    {athlete.filial_nome || '-'}
                  </TableCell>
                  {usesBaterias && (
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {athleteBateriaId || '-'}
                      </Badge>
                    </TableCell>
                  )}
                  {allScoringFields.map((campo) => (
                    <TableCell key={campo.chave_campo}>
                      <DynamicInputField
                        campo={campo}
                        athleteId={athlete.atleta_id}
                        value={scoreData[athlete.atleta_id]?.[campo.chave_campo] || ''}
                        onChange={handleFieldChange}
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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Botões para cálculo de colocações em lote */}
      {calculatedFields.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Calcular Colocações na Bateria</h4>
          <div className="text-xs text-blue-700 mb-3">
            Após inserir todas as pontuações, use os botões abaixo para calcular as colocações de todos os atletas. 
            As colocações aparecerão automaticamente na tabela após o cálculo.
          </div>
          <div className="flex flex-wrap gap-2">
            {calculatedFields.map(campo => (
              <Button
                key={campo.chave_campo}
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('Botão de colocação clicado para campo:', campo.chave_campo);
                  handleCalculateBatchPlacements(campo.chave_campo);
                }}
                disabled={isCalculating}
              >
                <Calculator className="h-3 w-3 mr-1" />
                {campo.rotulo_campo}
              </Button>
            ))}
          </div>
          {isCalculating && (
            <div className="text-xs text-blue-600 mt-2 flex items-center gap-2">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Calculando colocações...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
