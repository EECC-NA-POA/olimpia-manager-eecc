
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AthleteTableRow } from '../AthleteTableRow';
import { Athlete } from '../../../hooks/useAthletes';
import { CampoModelo } from '@/types/dynamicScoring';

interface MainScoringTableProps {
  athletes: Athlete[];
  campos: CampoModelo[];
  selectedBateriaId?: number | null;
  editingAthletes: Set<string>;
  editValues: Record<string, any>;
  unsavedChanges: Set<string>;
  isSaving: boolean;
  onEdit: (athleteId: string) => void;
  onSave: (athleteId: string) => void;
  onCancel: (athleteId: string) => void;
  onFieldChange: (athleteId: string, fieldKey: string, value: string | number) => void;
  getFieldValue: (athleteId: string, fieldKey: string) => string | number;
  getDisplayValue: (athleteId: string, fieldKey: string) => string;
  hasExistingScore: (athleteId: string) => boolean;
  onRemoveAthleteFromTable: (athleteId: string) => void;
  onDeleteScores: (athleteId: string) => void;
  selectedUnscored: Set<string>;
}

export function MainScoringTable({
  athletes,
  campos,
  selectedBateriaId,
  editingAthletes,
  editValues,
  unsavedChanges,
  isSaving,
  onEdit,
  onSave,
  onCancel,
  onFieldChange,
  getFieldValue,
  getDisplayValue,
  hasExistingScore,
  onRemoveAthleteFromTable,
  onDeleteScores,
  selectedUnscored
}: MainScoringTableProps) {
  if (athletes.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Atleta</TableHead>
            <TableHead className="w-[150px]">Filial</TableHead>
            {campos.map((campo) => (
              <TableHead key={campo.id} className="text-center min-w-[120px]">
                <div className="flex flex-col items-center">
                  <span className="font-medium">{campo.rotulo_campo}</span>
                  {campo.obrigatorio && <span className="text-red-500 text-xs">*obrigatório</span>}
                  <span className="text-xs text-muted-foreground">({campo.tipo_input})</span>
                </div>
              </TableHead>
            ))}
            <TableHead className="w-[200px] text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {athletes.map((athlete, index) => (
            <AthleteTableRow
              key={athlete.atleta_id}
              athlete={athlete}
              campos={campos}
              isEditing={editingAthletes.has(athlete.atleta_id)}
              athleteHasScore={hasExistingScore(athlete.atleta_id)}
              hasUnsavedChanges={unsavedChanges.has(athlete.atleta_id)}
              editValues={editValues}
              selectedBateriaId={selectedBateriaId}
              athleteIndex={index} // Pass the index for sequential numbering
              onEdit={onEdit}
              onSave={onSave}
              onCancel={onCancel}
              onFieldChange={onFieldChange}
              getFieldValue={getFieldValue}
              getDisplayValue={getDisplayValue}
              isSaving={isSaving}
              canRemove={false}
              onDeleteScores={onDeleteScores}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
