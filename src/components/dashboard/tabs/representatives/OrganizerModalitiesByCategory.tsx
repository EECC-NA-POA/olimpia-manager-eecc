import React from 'react';
import { OrganizerModalityWithRepresentatives } from '@/lib/api/representatives';
import { OrganizerModalityCard } from './OrganizerModalityCard';

interface OrganizerModalitiesByCategoryProps {
  modalities: OrganizerModalityWithRepresentatives[];
  availableAthletes: any[] | undefined;
  athletesLoading: boolean;
  selectedModalityKey: string | null;
  onSetSelectedModality: (modalityId: number, filialId: string) => void;
  onAddRepresentative: (modalityId: number, filialId: string, atletaId: string) => void;
  onRemoveRepresentative: (modalityId: number, filialId: string, atletaId: string) => void;
  onCancelSelection: () => void;
}

export function OrganizerModalitiesByCategory({
  modalities,
  availableAthletes,
  athletesLoading,
  selectedModalityKey,
  onSetSelectedModality,
  onAddRepresentative,
  onRemoveRepresentative,
  onCancelSelection
}: OrganizerModalitiesByCategoryProps) {
  // Group modalities by category
  const modalitiesByCategory = modalities.reduce((acc, modality) => {
    const category = modality.categoria || 'Sem Categoria';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(modality);
    return acc;
  }, {} as Record<string, OrganizerModalityWithRepresentatives[]>);

  const categories = Object.keys(modalitiesByCategory).sort();

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <div className="sticky top-0 bg-background z-0 pb-2">
            <h3 className="text-lg font-semibold text-olimpics-text border-b-2 border-olimpics-green-primary pb-2">
              {category}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modalitiesByCategory[category].map((modality) => {
              const modalityKey = `${modality.id}-${modality.filial_id}`;
              return (
                <OrganizerModalityCard
                  key={modalityKey}
                  modality={modality}
                  availableAthletes={availableAthletes}
                  athletesLoading={athletesLoading}
                  isSelected={selectedModalityKey === modalityKey}
                  onSetSelectedModality={() => onSetSelectedModality(modality.id, modality.filial_id)}
                  onAddRepresentative={(atletaId) => onAddRepresentative(modality.id, modality.filial_id, atletaId)}
                  onRemoveRepresentative={(atletaId) => onRemoveRepresentative(modality.id, modality.filial_id, atletaId)}
                  onCancelSelection={onCancelSelection}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}