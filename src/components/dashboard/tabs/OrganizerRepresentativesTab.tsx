import React, { useState } from 'react';
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import {
  useAllModalitiesWithRepresentatives,
  useOrganizerRepresentativeMutations
} from "@/hooks/useModalityRepresentatives";
import { OrganizerModalitiesByCategory } from './representatives/OrganizerModalitiesByCategory';
import { fetchRegisteredAthletesForModality } from '@/lib/api/representatives';
import { useQuery } from '@tanstack/react-query';

interface OrganizerRepresentativesTabProps {
  eventId: string;
}

export function OrganizerRepresentativesTab({ eventId }: OrganizerRepresentativesTabProps) {
  const [selectedModalityKey, setSelectedModalityKey] = useState<string | null>(null);
  const [selectedModalityId, setSelectedModalityId] = useState<number | null>(null);
  const [selectedFilialId, setSelectedFilialId] = useState<string | null>(null);
  
  console.log('OrganizerRepresentativesTab props:', { eventId });

  const {
    data: modalities,
    isLoading,
    error,
    refetch
  } = useAllModalitiesWithRepresentatives(eventId);

  // Fetch registered athletes for selected modality and filial
  const {
    data: availableAthletes,
    isLoading: athletesLoading
  } = useQuery({
    queryKey: ['organizer-registered-athletes', selectedModalityId, selectedFilialId, eventId],
    queryFn: async () => {
      if (!selectedModalityId || !selectedFilialId) return [];
      return fetchRegisteredAthletesForModality(selectedFilialId, selectedModalityId, eventId);
    },
    enabled: !!selectedModalityId && !!selectedFilialId && !!eventId,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
  });

  const { setRepresentative, removeRepresentative } = useOrganizerRepresentativeMutations(eventId);

  console.log('Modalities data:', modalities);
  console.log('Loading state:', isLoading);
  console.log('Error state:', error);
  console.log('Selected modality key:', selectedModalityKey);
  console.log('Available athletes:', availableAthletes);

  const handleSetSelectedModality = (modalityId: number, filialId: string) => {
    const key = `${modalityId}-${filialId}`;
    console.log('Setting selected modality:', { modalityId, filialId, key });
    setSelectedModalityKey(key);
    setSelectedModalityId(modalityId);
    setSelectedFilialId(filialId);
  };

  const handleAddRepresentative = (modalityId: number, filialId: string, atletaId: string) => {
    console.log('Adding representative:', { modalityId, filialId, atletaId });
    setRepresentative.mutate({ modalityId, filialId, atletaId });
    setSelectedModalityKey(null);
    setSelectedModalityId(null);
    setSelectedFilialId(null);
  };

  const handleRemoveRepresentative = (modalityId: number, filialId: string, atletaId: string) => {
    console.log('Removing representative:', { modalityId, filialId, atletaId });
    removeRepresentative.mutate({ modalityId, filialId, atletaId });
  };

  const handleCancelSelection = () => {
    setSelectedModalityKey(null);
    setSelectedModalityId(null);
    setSelectedFilialId(null);
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
        selectedModalityKey={selectedModalityKey}
        onSetSelectedModality={handleSetSelectedModality}
        onAddRepresentative={handleAddRepresentative}
        onRemoveRepresentative={handleRemoveRepresentative}
        onCancelSelection={handleCancelSelection}
      />
    </div>
  );
}