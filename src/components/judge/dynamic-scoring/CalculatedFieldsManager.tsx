
import React, { useState } from 'react';
import { AthleteParticipationCard } from './calculated-fields-manager/AthleteParticipationCard';
import { CalculatedFieldsCard } from './calculated-fields-manager/CalculatedFieldsCard';
import { CalculationResultsCard } from './calculated-fields-manager/CalculationResultsCard';
import { BateriaSelector } from './BateriaSelector';
import { useCalculatedFieldsManager } from './calculated-fields-manager/hooks/useCalculatedFieldsManager';

interface CalculatedFieldsManagerProps {
  modeloId: number;
  modalityId: number;
  eventId: string;
  bateriaId?: number;
}

export function CalculatedFieldsManager({
  modeloId,
  modalityId,
  eventId,
  bateriaId: initialBateriaId
}: CalculatedFieldsManagerProps) {
  const [selectedBateriaId, setSelectedBateriaId] = useState<number | undefined>(initialBateriaId);
  
  const {
    selectedFields,
    calculationResults,
    showResults,
    calculatedFields,
    athletesWithParticipation,
    participatingAthletes,
    canCalculateFields,
    isCalculating,
    isLoadingParticipation,
    canCalculate,
    toggleAthleteParticipation,
    handleFieldSelection,
    handleCalculateSelected,
    handleConfirmCalculations,
    handleCancelResults
  } = useCalculatedFieldsManager({
    modeloId,
    modalityId,
    eventId,
    bateriaId: selectedBateriaId
  });

  const handleBateriaSelect = (bateriaId: number | undefined) => {
    setSelectedBateriaId(bateriaId);
  };

  return (
    <div className="space-y-6">
      {/* Bateria Selection */}
      <BateriaSelector
        modalityId={modalityId}
        eventId={eventId}
        selectedBateriaId={selectedBateriaId}
        onBateriaSelect={handleBateriaSelect}
      />

      {/* Athletes Participation Status */}
      <AthleteParticipationCard
        athletesWithParticipation={athletesWithParticipation}
        isLoading={isLoadingParticipation}
        onToggleParticipation={toggleAthleteParticipation}
      />

      {/* Calculated Fields Management */}
      <CalculatedFieldsCard
        calculatedFields={calculatedFields}
        selectedFields={selectedFields}
        canCalculateFields={canCalculateFields}
        participatingCount={participatingAthletes.length}
        isCalculating={isCalculating}
        onFieldSelection={handleFieldSelection}
        onCalculateSelected={handleCalculateSelected}
        canCalculate={canCalculate}
      />

      {/* Calculation Results */}
      {showResults && (
        <CalculationResultsCard
          calculationResults={calculationResults}
          athletesWithParticipation={athletesWithParticipation}
          isCalculating={isCalculating}
          onConfirmCalculations={handleConfirmCalculations}
          onCancelResults={handleCancelResults}
        />
      )}
    </div>
  );
}
