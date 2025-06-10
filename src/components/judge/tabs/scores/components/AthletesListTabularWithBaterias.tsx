
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { BateriaNavigator } from './BateriaNavigator';
import { AthletesListTabular } from './AthletesListTabular';
import { DynamicAthletesTable } from './DynamicAthletesTable';
import { useBateriaSelection } from '../hooks/useBateriaSelection';
import { useModelosModalidade } from '@/hooks/useDynamicScoring';
import { Athlete } from '../hooks/useAthletes';

interface AthletesListTabularWithBateriasProps {
  athletes: Athlete[];
  isLoading: boolean;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType?: 'tempo' | 'distancia' | 'pontos';
  modalityRule?: any;
}

export function AthletesListTabularWithBaterias({
  athletes,
  isLoading,
  modalityId,
  eventId,
  judgeId,
  scoreType,
  modalityRule
}: AthletesListTabularWithBateriasProps) {
  const {
    selectedBateriaId,
    handleBateriaSelect,
    handleCreateBateria,
    isCreatingBateria
  } = useBateriaSelection({
    modalityId,
    eventId
  });

  // Check if this modality uses dynamic scoring
  const { data: modelos } = useModelosModalidade(modalityId);
  const hasDynamicScoring = modelos && modelos.length > 0;
  const modelo = modelos?.[0];

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      {/* Bateria Navigation */}
      <BateriaNavigator
        modalityId={modalityId}
        eventId={eventId}
        selectedBateriaId={selectedBateriaId}
        onBateriaSelect={handleBateriaSelect}
        onCreateBateria={handleCreateBateria}
      />

      {/* Athletes Table */}
      {hasDynamicScoring && modelo ? (
        <DynamicAthletesTable
          athletes={athletes}
          modalityId={modalityId}
          eventId={eventId}
          judgeId={judgeId}
          modelo={modelo}
        />
      ) : (
        <AthletesListTabular
          athletes={athletes}
          isLoading={isLoading}
          modalityId={modalityId}
          eventId={eventId}
          judgeId={judgeId}
          scoreType={scoreType}
          modalityRule={modalityRule}
          selectedBateriaId={selectedBateriaId}
        />
      )}
    </div>
  );
}
