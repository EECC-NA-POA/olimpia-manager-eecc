
import React from 'react';
import { ModalityWithRepresentatives } from '@/lib/api/representatives';
import { ModalityCard } from './ModalityCard';

interface ModalitiesByCategoryProps {
  modalities: ModalityWithRepresentatives[];
  availableAthletes: any[] | undefined;
  athletesLoading: boolean;
  selectedModalityForChange: number | null;
  onSetSelectedModality: (modalityId: number) => void;
  onAddRepresentative: (modalityId: number, atletaId: string) => void;
  onRemoveRepresentative: (modalityId: number, atletaId: string) => void;
  onCancelSelection: () => void;
}

export function ModalitiesByCategory({
  modalities,
  availableAthletes,
  athletesLoading,
  selectedModalityForChange,
  onSetSelectedModality,
  onAddRepresentative,
  onRemoveRepresentative,
  onCancelSelection
}: ModalitiesByCategoryProps) {
  // Group modalities by category
  const modalitiesByCategory = modalities.reduce((acc, modality) => {
    const category = modality.categoria || 'Sem Categoria';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(modality);
    return acc;
  }, {} as Record<string, ModalityWithRepresentatives[]>);

  const categories = Object.keys(modalitiesByCategory).sort();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <div className="sticky top-0 bg-white z-10 pb-2">
            <h3 className="text-lg font-semibold text-olimpics-text border-b-2 border-olimpics-green-primary pb-2 mb-4">
              {category}
            </h3>
          </div>
          <div className="space-y-4">
            {modalitiesByCategory[category].map((modality) => (
              <ModalityCard
                key={modality.id}
                modality={modality}
                availableAthletes={availableAthletes}
                athletesLoading={athletesLoading}
                selectedModalityForChange={selectedModalityForChange}
                onSetSelectedModality={onSetSelectedModality}
                onAddRepresentative={onAddRepresentative}
                onRemoveRepresentative={onRemoveRepresentative}
                onCancelSelection={onCancelSelection}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
