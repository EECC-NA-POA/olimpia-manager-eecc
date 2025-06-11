
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Edit2, X, Check, Trophy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useCamposModelo } from '@/hooks/useDynamicScoring';
import { useDynamicScoringSubmission } from '@/hooks/useDynamicScoringSubmission';
import { Athlete } from '../hooks/useAthletes';
import { useDynamicScoringTableState } from './dynamic-scoring-table/useDynamicScoringTableState';
import { UnsavedChangesBanner } from './dynamic-scoring-table/UnsavedChangesBanner';
import { DynamicInputField } from './dynamic-scoring-table/DynamicInputField';
import { AthleteStatusCell } from './dynamic-scoring-table/AthleteStatusCell';
import { filterScoringFields, modelUsesBaterias } from '@/utils/dynamicScoringUtils';

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

  // Filter to only scoring fields (remove configuration fields)
  const campos = filterScoringFields(allCampos);
  const usesBaterias = modelUsesBaterias(allCampos);

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
    campos: campos // Pass filtered campos
  });

  console.log('DynamicScoringTable - All campos:', allCampos);
  console.log('DynamicScoringTable - Filtered scoring campos:', campos);
  console.log('DynamicScoringTable - Uses baterias:', usesBaterias);

  if (isLoadingCampos) {
    return <div>Carregando campos...</div>;
  }

  if (campos.length === 0) {
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

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px] sticky left-0 bg-background">Atleta</TableHead>
              <TableHead className="min-w-[150px]">Filial</TableHead>
              {campos.map((campo) => (
                <TableHead key={campo.chave_campo} className="min-w-[120px]">
                  <div className="flex flex-col">
                    <span>{campo.rotulo_campo}</span>
                    {campo.obrigatorio && (
                      <Badge variant="outline" className="text-xs w-fit">
                        Obrigatório
                      </Badge>
                    )}
                    {campo.metadados?.formato_resultado && (
                      <Badge variant="outline" className="text-xs w-fit bg-green-50">
                        {campo.metadados.formato_resultado}
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
                  {campos.map((campo) => (
                    <TableCell key={campo.chave_campo}>
                      <DynamicInputField
                        campo={campo}
                        athleteId={athlete.atleta_id}
                        value={scoreData[athlete.atleta_id]?.[campo.chave_campo] || ''}
                        onChange={handleFieldChange}
                      />
                    </TableCell>
                  ))}
                  <AthleteStatusCell
                    athleteId={athlete.atleta_id}
                    athleteName={athlete.atleta_nome}
                    completionStatus={status}
                    hasUnsavedChanges={hasUnsavedChanges}
                    onSave={saveAthleteScore}
                    isSaving={dynamicSubmission.isPending}
                  />
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
