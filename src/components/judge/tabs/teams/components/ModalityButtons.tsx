
import React from 'react';
import { Button } from '@/components/ui/button';
import { ModalityOption } from '../types';

interface ModalityButtonsProps {
  modalities: ModalityOption[];
  selectedModalityId: number | null;
  onModalitySelect: (modalityId: number) => void;
}

export function ModalityButtons({
  modalities,
  selectedModalityId,
  onModalitySelect
}: ModalityButtonsProps) {
  if (modalities.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Modalidades Coletivas</h3>
      <div className="flex flex-wrap gap-3">
        {modalities.map((modality) => (
          <Button
            key={modality.id}
            variant={selectedModalityId === modality.id ? "default" : "outline"}
            onClick={() => onModalitySelect(modality.id)}
            className="flex-shrink-0"
          >
            {modality.nome} - {modality.categoria}
          </Button>
        ))}
      </div>
    </div>
  );
}
