
import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { Athlete } from '../../../hooks/useAthletes';
import { CampoModelo } from '@/types/dynamicScoring';
import { DynamicTableHeader } from '../DynamicTableHeader';
import { AthleteTableRow } from '../AthleteTableRow';
import { filterScoringFields } from '@/utils/dynamicScoringUtils';

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
  const getBateriaDisplayName = (bateriaId: number | null) => {
    if (bateriaId === 999) return 'Final';
    return bateriaId?.toString() || '';
  };

  // DOUBLE CHECK: Apply additional filtering as a safety measure
  const finalScoringFields = filterScoringFields(campos);
  
  console.log('=== MAIN SCORING TABLE FIELD VERIFICATION ===');
  console.log('MainScoringTable - Received campos count:', campos.length);
  console.log('MainScoringTable - Final scoring fields count:', finalScoringFields.length);
  console.log('MainScoringTable - Final scoring fields:', finalScoringFields.map(c => ({ key: c.chave_campo, label: c.rotulo_campo })));

  return (
    <div className="border rounded-lg overflow-hidden">
      {selectedBateriaId && (
        <div className="bg-blue-50 border-b border-blue-200 p-3">
          <div className="text-blue-800 text-sm font-medium">
            Sistema de Baterias Ativo - Bateria {getBateriaDisplayName(selectedBateriaId)}
          </div>
          <div className="text-blue-700 text-xs mt-1">
            Pontuações serão registradas para a bateria selecionada
          </div>
        </div>
      )}
      
      <Table>
        <DynamicTableHeader campos={finalScoringFields} />
        <TableBody>
          {athletes.map((athlete) => {
            const isEditing = editingAthletes.has(athlete.atleta_id);
            const athleteHasScore = hasExistingScore(athlete.atleta_id);
            const canRemove = !athleteHasScore && selectedUnscored.has(athlete.atleta_id);
            
            return (
              <AthleteTableRow
                key={athlete.atleta_id}
                athlete={athlete}
                campos={finalScoringFields}
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
                canRemove={canRemove}
                onRemove={onRemoveAthleteFromTable}
                onDeleteScores={onDeleteScores}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
