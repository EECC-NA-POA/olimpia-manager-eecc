
import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useModalities } from './scores/hooks/useModalities';
import { useAthletes } from './scores/hooks/useAthletes';
import { ModalityCard } from './scores/components/ModalityCard';
import { NoModalitiesCard } from './scores/components/NoModalitiesCard';
import { AthletesListTabular } from './scores/components/AthletesListTabular';

interface ScoresTabProps {
  userId: string;
  eventId: string | null;
}

export function ScoresTab({ userId, eventId }: ScoresTabProps) {
  const [selectedModalityId, setSelectedModalityId] = useState<number | null>(null);

  // Fetch modalities using our custom hook
  const { modalities, isLoadingModalities } = useModalities(eventId);

  // Filter to show only individual modalities
  const individualModalities = modalities?.filter(m => m.tipo_modalidade === 'individual');

  // Fetch athletes when a modality is selected using our custom hook
  const { athletes, isLoadingAthletes } = useAthletes(selectedModalityId, eventId);

  // Get selected modality with its rule
  const selectedModality = individualModalities?.find(m => m.modalidade_id === selectedModalityId);

  if (isLoadingModalities) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!individualModalities || individualModalities.length === 0) {
    return <NoModalitiesCard />;
  }

  return (
    <div className="space-y-6">
      <ModalityCard 
        modalities={individualModalities}
        onSelectModality={setSelectedModalityId}
        selectedModalityId={selectedModalityId}
      />
      
      {selectedModalityId && (
        <AthletesListTabular
          athletes={athletes}
          isLoading={isLoadingAthletes}
          modalityId={selectedModalityId}
          eventId={eventId}
          judgeId={userId}
          scoreType={selectedModality?.tipo_pontuacao}
          modalityRule={selectedModality?.regra}
        />
      )}
    </div>
  );
}
