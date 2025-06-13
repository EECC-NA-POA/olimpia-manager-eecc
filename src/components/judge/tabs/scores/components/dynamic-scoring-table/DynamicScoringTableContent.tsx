
import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { Athlete } from '../../../hooks/useAthletes';
import { CampoModelo } from '@/types/dynamicScoring';
import { DynamicTableHeader } from './DynamicTableHeader';
import { AthleteTableRow } from './AthleteTableRow';

interface DynamicScoringTableContentProps {
  athletes: Athlete[];
  campos: CampoModelo[];
  selectedBateriaId?: number | null;
  editingAthletes: Set<string>;
  editValues: Record<string, any>;
  unsavedChanges: Set<string>;
  existingScores: any[];
  isSaving: boolean;
  onEdit: (athleteId: string) => void;
  onSave: (athleteId: string) => void;
  onCancel: (athleteId: string) => void;
  onFieldChange: (athleteId: string, fieldKey: string, value: string | number) => void;
  getFieldValue: (athleteId: string, fieldKey: string) => string | number;
  getDisplayValue: (athleteId: string, fieldKey: string) => string;
  hasExistingScore: (athleteId: string) => boolean;
}

export function DynamicScoringTableContent({
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
  hasExistingScore
}: DynamicScoringTableContentProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {selectedBateriaId && (
        <div className="bg-blue-50 border-b border-blue-200 p-3">
          <div className="text-blue-800 text-sm font-medium">
            Sistema de Baterias Ativo - Bateria {selectedBateriaId === 999 ? 'Final' : selectedBateriaId}
          </div>
          <div className="text-blue-700 text-xs mt-1">
            Pontuações serão registradas para a bateria selecionada
          </div>
        </div>
      )}
      
      <Table>
        <DynamicTableHeader campos={campos} />
        <TableBody>
          {athletes.map((athlete) => {
            const isEditing = editingAthletes.has(athlete.atleta_id);
            const athleteHasScore = hasExistingScore(athlete.atleta_id);
            
            return (
              <AthleteTableRow
                key={athlete.atleta_id}
                athlete={athlete}
                campos={campos}
                isEditing={isEditing}
                athleteHasScore={athleteHasScore}
                hasUnsavedChanges={unsavedChanges.has(athlete.atleta_id)}
                editValues={editValues}
                selectedBateriaId={selectedBateriaId}
                onEdit={onEdit}
                onSave={onSave}
                onCancel={onCancel}
                onFieldChange={onFieldChange}
                getFieldValue={getFieldValue}
                getDisplayValue={getDisplayValue}
                isSaving={isSaving}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
