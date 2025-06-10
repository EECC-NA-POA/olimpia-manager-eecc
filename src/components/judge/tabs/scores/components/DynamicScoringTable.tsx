
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
  const {
    scoreData,
    unsavedChanges,
    campos,
    isLoadingCampos,
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
    modelo
  });

  if (isLoadingCampos) {
    return <div>Carregando campos...</div>;
  }

  if (campos.length === 0) {
    return <div>Nenhum campo configurado para este modelo.</div>;
  }

  return (
    <div className="space-y-4">
      <UnsavedChangesBanner
        unsavedCount={unsavedChanges.size}
        onSaveAll={saveAllScores}
        isSaving={dynamicSubmission.isPending}
      />

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
