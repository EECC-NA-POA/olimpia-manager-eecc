
import React from 'react';
import { Button } from '@/components/ui/button';

interface ModalityOption {
  id: number;
  nome: string;
  categoria?: string;
}

interface ManagementModalityButtonsProps {
  modalities: ModalityOption[];
  selectedModalityId: number | null;
  onSelectModality: (id: number) => void;
}

export function ManagementModalityButtons({
  modalities,
  selectedModalityId,
  onSelectModality
}: ManagementModalityButtonsProps) {
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
            onClick={() => onSelectModality(modality.id)}
            className="flex-shrink-0"
          >
            {modality.nome} {modality.categoria && `- ${modality.categoria}`}
          </Button>
        ))}
      </div>
    </div>
  );
}
