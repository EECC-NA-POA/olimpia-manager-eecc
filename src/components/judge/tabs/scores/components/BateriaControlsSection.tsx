
import React from 'react';
import { BateriaNavigationTabs } from './BateriaNavigationTabs';
import { BateriaAthleteSelector } from './BateriaAthleteSelector';
import { Athlete } from '../hooks/useAthletes';

interface BateriaControlsSectionProps {
  usesBaterias: boolean;
  eventId: string | null;
  regularBaterias: any[];
  finalBateria: any;
  selectedBateriaId: number | null;
  onSelectBateria: (id: number | null) => void;
  onCreateNewBateria: () => void;
  onCreateFinalBateria: () => void;
  hasFinalBateria: boolean;
  isCreating: boolean;
  athletes: Athlete[];
  selectedAthletes: Set<string>;
  onAthleteToggle: (athleteId: string) => void;
  onSelectAll: (filteredAthletes: Athlete[]) => void;
  onClearAll: () => void;
}

export function BateriaControlsSection({
  usesBaterias,
  eventId,
  regularBaterias,
  finalBateria,
  selectedBateriaId,
  onSelectBateria,
  onCreateNewBateria,
  onCreateFinalBateria,
  hasFinalBateria,
  isCreating,
  athletes,
  selectedAthletes,
  onAthleteToggle,
  onSelectAll,
  onClearAll
}: BateriaControlsSectionProps) {
  if (!usesBaterias) return null;

  return (
    <>
      <BateriaNavigationTabs
        regularBaterias={regularBaterias}
        finalBateria={finalBateria}
        selectedBateriaId={selectedBateriaId}
        onSelectBateria={onSelectBateria}
        onCreateNewBateria={onCreateNewBateria}
        onCreateFinalBateria={onCreateFinalBateria}
        hasFinalBateria={hasFinalBateria}
        isCreating={isCreating}
        usesBaterias={usesBaterias}
      />

      {eventId && (
        <BateriaAthleteSelector
          athletes={athletes}
          selectedBateriaId={selectedBateriaId}
          selectedAthletes={selectedAthletes}
          onAthleteToggle={onAthleteToggle}
          onSelectAll={onSelectAll}
          onClearAll={onClearAll}
        />
      )}
    </>
  );
}
