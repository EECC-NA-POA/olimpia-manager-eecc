
import React from 'react';
import { Athlete } from '../../hooks/useAthletes';
import { CampoModelo, ModeloModalidade } from '@/types/dynamicScoring';
import { DynamicScoringTableContent } from './DynamicScoringTableContent';
import { useDynamicScoringTableState } from './useDynamicScoringTableState';
import { useDynamicScoringTableOperations } from './useDynamicScoringTableOperations';
import { useDynamicScoringFieldValues } from './useDynamicScoringFieldValues';

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
    campos,
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
      campos={campos}
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
