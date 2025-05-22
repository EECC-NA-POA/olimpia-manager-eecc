
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Modality } from '@/lib/types/database';

interface ModalitySelectorProps {
  modalities: Modality[] | undefined;
  onSelectModality: (id: number) => void;
}

export function ModalitySelector({ modalities, onSelectModality }: ModalitySelectorProps) {
  if (!modalities || modalities.length === 0) {
    return null;
  }

  const handleModalityChange = (value: string) => {
    onSelectModality(Number(value));
  };

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Modalidade</label>
      <Select onValueChange={handleModalityChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione uma modalidade" />
        </SelectTrigger>
        <SelectContent>
          {modalities.map((modality) => (
            <SelectItem 
              key={modality.modalidade_id} 
              value={modality.modalidade_id.toString()}
            >
              {modality.modalidade_nome} - {modality.categoria}
              {' '}
              <span className="text-muted-foreground text-xs ml-1">
                ({modality.tipo_pontuacao === 'time' ? 'Tempo' : 
                  modality.tipo_pontuacao === 'distance' ? 'Distância' : 'Pontos'})
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
