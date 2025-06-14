
import React from 'react';
import { Athlete } from '../../hooks/useAthletes';
import { CampoModelo } from '@/types/dynamicScoring';
import { AthleteScoreDeletionDialog } from './AthleteScoreDeletionDialog';
import { useAthleteScoreDeletion } from './hooks/useAthleteScoreDeletion';
import { useAthleteSelection } from './hooks/useAthleteSelection';
import { useAthleteGrouping } from './hooks/useAthleteGrouping';
import { MainScoringTable } from './components/MainScoringTable';
import { UnscoredAthletesSection } from './components/UnscoredAthletesSection';
import { EmptyStateMessage } from './components/EmptyStateMessage';

interface DynamicScoringTableContentProps {
  athletes: Athlete[];
  campos: CampoModelo[];
  selectedBateriaId?: number | null;
  editingAthletes: Set<string>;
  editValues: Record<string, any>;
  unsavedChanges: Set<string>;
  existingScores: any[];
  isSaving: boolean;
  modalityId: number;
  eventId: string;
  modalityName?: string;
  usesBaterias: boolean;
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
  existingScores,
  isSaving,
  modalityId,
  eventId,
  modalityName,
  usesBaterias,
  onEdit,
  onSave,
  onCancel,
  onFieldChange,
  getFieldValue,
  getDisplayValue,
  hasExistingScore
}: DynamicScoringTableContentProps) {
  const [athleteToDelete, setAthleteToDelete] = React.useState<Athlete | null>(null);
  
  const { deleteScores, isDeleting } = useAthleteScoreDeletion();
  
  const {
    selectedUnscored,
    handleUnscoredSelection,
    handleSelectAllUnscored,
    handleDeselectAllUnscored,
    handleAddSelectedToTable,
    handleRemoveAthleteFromTable
  } = useAthleteSelection();

  const { mainTableAthletes, unscoredSectionAthletes } = useAthleteGrouping({
    athletes,
    selectedBateriaId,
    existingScores,
    hasExistingScore,
    selectedUnscored,
    usesBaterias
  });

  console.log('DynamicScoringTableContent - Debug info:', {
    totalAthletes: athletes.length,
    mainTableAthletes: mainTableAthletes.length,
    unscoredSectionAthletes: unscoredSectionAthletes.length,
    selectedBateriaId,
    usesBaterias
  });

  const handleDeleteScores = async (athleteId: string) => {
    const athlete = athletes.find(a => a.atleta_id === athleteId);
    if (athlete) {
      setAthleteToDelete(athlete);
    }
  };

  const confirmDeleteScores = async () => {
    if (!athleteToDelete) return;

    try {
      await deleteScores({
        athleteId: athleteToDelete.atleta_id,
        modalityId,
        eventId,
        bateriaId: usesBaterias ? selectedBateriaId : null
      });
      setAthleteToDelete(null);
    } catch (error) {
      console.error('Failed to delete scores:', error);
    }
  };

  const totalVisibleAthletes = mainTableAthletes.length + unscoredSectionAthletes.length;
  const hasAnyAthletes = athletes.length > 0;

  console.log('Rendering decision:', {
    hasAnyAthletes,
    totalVisibleAthletes,
    athletesLength: athletes.length,
    mainTableAthletesLength: mainTableAthletes.length,
    unscoredSectionAthletesLength: unscoredSectionAthletes.length
  });

  return (
    <div className="space-y-4">
      {/* Main scoring table */}
      <MainScoringTable
        athletes={mainTableAthletes}
        campos={campos}
        selectedBateriaId={selectedBateriaId}
        editingAthletes={editingAthletes}
        editValues={editValues}
        unsavedChanges={unsavedChanges}
        isSaving={isSaving}
        onEdit={onEdit}
        onSave={onSave}
        onCancel={onCancel}
        onFieldChange={onFieldChange}
        getFieldValue={getFieldValue}
        getDisplayValue={getDisplayValue}
        hasExistingScore={hasExistingScore}
        onRemoveAthleteFromTable={handleRemoveAthleteFromTable}
        onDeleteScores={handleDeleteScores}
        selectedUnscored={selectedUnscored}
      />

      {/* Unscored athletes section - only show for bateria system */}
      {usesBaterias && (
        <UnscoredAthletesSection
          athletes={unscoredSectionAthletes}
          selectedBateriaId={selectedBateriaId}
          selectedUnscored={selectedUnscored}
          onUnscoredSelection={handleUnscoredSelection}
          onSelectAllUnscored={() => handleSelectAllUnscored(unscoredSectionAthletes.map(a => a.atleta_id))}
          onDeselectAllUnscored={handleDeselectAllUnscored}
          onAddSelectedToTable={handleAddSelectedToTable}
        />
      )}

      <AthleteScoreDeletionDialog
        isOpen={!!athleteToDelete}
        onClose={() => setAthleteToDelete(null)}
        onConfirm={confirmDeleteScores}
        athlete={athleteToDelete}
        modalityName={modalityName}
        bateriaId={usesBaterias ? selectedBateriaId : null}
        isDeleting={isDeleting}
      />

      <EmptyStateMessage 
        hasAthletes={hasAnyAthletes}
        selectedBateriaId={usesBaterias ? selectedBateriaId : null}
        usesBaterias={usesBaterias}
      />
    </div>
  );
}
