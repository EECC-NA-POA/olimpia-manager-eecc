import React, { useState } from 'react';
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import {
  useAllModalitiesWithRepresentatives,
  useOrganizerRegisteredAthletes,
  useOrganizerRepresentativeMutations
} from "@/hooks/useModalityRepresentatives";
import { OrganizerModalitiesByCategory } from './representatives/OrganizerModalitiesByCategory';

interface OrganizerRepresentativesTabProps {
  eventId: string;
}

export function OrganizerRepresentativesTab({ eventId }: OrganizerRepresentativesTabProps) {
  const [selectedModalityForChange, setSelectedModalityForChange] = useState<number | null>(null);
  
  console.log('OrganizerRepresentativesTab props:', { eventId });

  const {
    data: modalities,
    isLoading,
    error,
    refetch
  } = useAllModalitiesWithRepresentatives(eventId);

  const {
    data: availableAthletes,
    isLoading: athletesLoading
  } = useOrganizerRegisteredAthletes(selectedModalityForChange, eventId);

  const { setRepresentative, removeRepresentative } = useOrganizerRepresentativeMutations(eventId);

  console.log('Modalities data:', modalities);
  console.log('Loading state:', isLoading);
  console.log('Error state:', error);

  const handleAddRepresentative = (modalityId: number, atletaId: string) => {
    console.log('Adding representative:', { modalityId, atletaId });
    setRepresentative.mutate({ modalityId, atletaId });
    setSelectedModalityForChange(null);
  };

  const handleRemoveRepresentative = (modalityId: number, atletaId: string) => {
    console.log('Removing representative:', { modalityId, atletaId });
    removeRepresentative.mutate({ modalityId, atletaId });
  };

  // Validate required props
  if (!eventId) {
    console.error('Missing required props:', { eventId });
    return (
      <EmptyState
        title="Dados insuficientes"
        description="Não foi possível carregar os representantes. Evento não identificado."
      />
    );
  }

  if (isLoading) {
    console.log('Loading modalities...');
    return <LoadingState />;
  }

  if (error) {
    console.error('Error loading modalities for organizer:', error);
    return <ErrorState onRetry={refetch} />;
  }

  if (!modalities || modalities.length === 0) {
    console.log('No modalities found');
    return (
      <EmptyState
        title="Nenhuma modalidade encontrada"
        description="Não há modalidades ativas para este evento"
      />
    );
  }

  console.log('Rendering modalities:', modalities.length);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-olimpics-text mb-2">
          Gestão de Representantes por Modalidade
        </h2>
        <p className="text-gray-600">
          Defina atletas representantes para cada modalidade de todas as filiais. 
          Você pode adicionar múltiplos representantes por modalidade. 
          Apenas atletas inscritos e confirmados na modalidade podem ser selecionados como representantes.
        </p>
      </div>

      <OrganizerModalitiesByCategory
        modalities={modalities}
        availableAthletes={availableAthletes}
        athletesLoading={athletesLoading}
        selectedModalityForChange={selectedModalityForChange}
        onSetSelectedModality={setSelectedModalityForChange}
        onAddRepresentative={handleAddRepresentative}
        onRemoveRepresentative={handleRemoveRepresentative}
        onCancelSelection={() => setSelectedModalityForChange(null)}
      />
    </div>
  );
}