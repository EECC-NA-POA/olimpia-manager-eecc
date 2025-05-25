
import React from 'react';
import { Button } from '@/components/ui/button';
import { Modality } from '@/lib/types/database';

interface ModalityButtonsProps {
  modalities: Modality[];
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
      <h3 className="text-lg font-medium">Modalidades Individuais</h3>
      <div className="flex flex-wrap gap-3">
        {modalities.map((modality) => (
          <Button
            key={modality.modalidade_id}
            variant={selectedModalityId === modality.modalidade_id ? "default" : "outline"}
            onClick={() => onModalitySelect(modality.modalidade_id)}
            className="flex-shrink-0"
          >
            {modality.modalidade_nome} - {modality.categoria}
            <span className="text-xs ml-2 opacity-70">
              ({modality.tipo_pontuacao === 'tempo' ? 'Tempo' : 
                modality.tipo_pontuacao === 'distancia' ? 'Distância' : 'Pontos'})
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
