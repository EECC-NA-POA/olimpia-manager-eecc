
import React, { useState } from 'react';
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import {
  useModalitiesWithRepresentatives,
  useRegisteredAthletes,
  useRepresentativeMutations
} from "@/hooks/useModalityRepresentatives";
import { ModalitiesByCategory } from './representatives/ModalitiesByCategory';

interface RepresentativesTabProps {
  filialId: string;
  eventId: string;
}

export function RepresentativesTab({ filialId, eventId }: RepresentativesTabProps) {
  const [selectedModalityForChange, setSelectedModalityForChange] = useState<number | null>(null);
  
  console.log('RepresentativesTab props:', { filialId, eventId });

  const {
    data: modalities,
    isLoading,
    error,
    refetch
  } = useModalitiesWithRepresentatives(filialId, eventId);

  const {
    data: availableAthletes,
    isLoading: athletesLoading
  } = useRegisteredAthletes(filialId, selectedModalityForChange, eventId);

  const { setRepresentative, removeRepresentative } = useRepresentativeMutations(filialId, eventId);

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
  if (!filialId || !eventId) {
    console.error('Missing required props:', { filialId, eventId });
    return (
      <EmptyState
        title="Dados insuficientes"
        description="Não foi possível carregar os representantes. Filial ou evento não identificado."
      />
    );
  }

  if (isLoading) {
    console.log('Loading modalities...');
    return <LoadingState />;
  }

  if (error) {
    console.error('Error loading modalities:', error);
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
          Defina atletas representantes para cada modalidade da sua filial. 
          Você pode adicionar múltiplos representantes por modalidade. 
          Apenas atletas inscritos e confirmados na modalidade podem ser selecionados como representantes.
        </p>
      </div>

      <ModalitiesByCategory
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
