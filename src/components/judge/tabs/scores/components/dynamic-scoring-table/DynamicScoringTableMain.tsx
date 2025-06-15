
import React from 'react';
import { Athlete } from '../../hooks/useAthletes';
import { CampoModelo, ModeloModalidade } from '@/types/dynamicScoring';
import { DynamicScoringTableContent } from './DynamicScoringTableContent';
import { useDynamicScoringTableState } from './useDynamicScoringTableState';
import { useDynamicScoringTableOperations } from './useDynamicScoringTableOperations';
import { useDynamicScoringFieldValues } from './useDynamicScoringFieldValues';
import { filterScoringFields } from '@/utils/dynamicScoringUtils';

interface DynamicScoringTableMainProps {
  athletes: Athlete[];
  modalityId: number;
  eventId: string;
  judgeId: string;
  modelo: ModeloModalidade;
  campos: CampoModelo[];
  selectedBateriaId?: number | null;
  existingScores: any[];
  refetchScores: () => Promise<any>;
  modalityName?: string;
  usesBaterias?: boolean;
}

export function DynamicScoringTableMain({
  athletes,
  modalityId,
  eventId,
  judgeId,
  modelo,
  campos,
  selectedBateriaId,
  existingScores,
  refetchScores,
  modalityName,
  usesBaterias = false
}: DynamicScoringTableMainProps) {
  // CRITICAL: Always filter to ensure configuration fields NEVER reach the table components
  const scoringFields = filterScoringFields(campos);
  
  console.log('=== DYNAMIC SCORING TABLE MAIN FIELD FILTERING ===');
  console.log('DynamicScoringTableMain - Original campos count:', campos.length);
  console.log('DynamicScoringTableMain - Filtered scoring fields count:', scoringFields.length);
  console.log('DynamicScoringTableMain - All original fields:', campos.map(c => ({ key: c.chave_campo, label: c.rotulo_campo })));
  console.log('DynamicScoringTableMain - Filtered fields:', scoringFields.map(c => ({ key: c.chave_campo, label: c.rotulo_campo })));
  console.log('DynamicScoringTableMain - Filtered out fields:', campos.filter(c => !scoringFields.includes(c)).map(c => ({ key: c.chave_campo, label: c.rotulo_campo })));

  const {
    editingAthletes,
    editValues,
    unsavedChanges,
    startEditing,
    stopEditing,
    clearUnsavedChanges,
    updateFieldValue,
    hasUnsavedChanges
  } = useDynamicScoringTableState();

  const {
    handleEdit,
    handleSave,
    handleCancel,
    isSaving
  } = useDynamicScoringTableOperations({
    modalityId,
    eventId,
    judgeId,
    modelo,
    selectedBateriaId,
    campos: scoringFields, // Pass only scoring fields to operations
    existingScores,
    editValues,
    refetchScores,
    stopEditing,
    clearUnsavedChanges
  });

  const {
    getFieldValue,
    getDisplayValue,
    hasExistingScore,
    handleFieldChange
  } = useDynamicScoringFieldValues({
    editValues,
    existingScores,
    selectedBateriaId,
    updateFieldValue,
    hasUnsavedChanges
  });

  const onEdit = (athleteId: string) => {
    handleEdit(athleteId, startEditing);
  };

  return (
    <DynamicScoringTableContent
      athletes={athletes}
      campos={scoringFields}
      selectedBateriaId={selectedBateriaId}
      editingAthletes={editingAthletes}
      editValues={editValues}
      unsavedChanges={unsavedChanges}
      existingScores={existingScores}
      isSaving={isSaving}
      modalityId={modalityId}
      eventId={eventId}
      modalityName={modalityName}
      usesBaterias={usesBaterias}
      onEdit={onEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      onFieldChange={handleFieldChange}
      getFieldValue={getFieldValue}
      getDisplayValue={getDisplayValue}
      hasExistingScore={hasExistingScore}
    />
  );
}
