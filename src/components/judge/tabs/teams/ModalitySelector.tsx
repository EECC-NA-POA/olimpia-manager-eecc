
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Modality } from './types';

interface ModalitySelectorProps {
  modalities: Modality[];
  onModalityChange: (value: string) => void;
}

export function ModalitySelector({ modalities, onModalityChange }: ModalitySelectorProps) {
  return (
    <div>
      <label className="text-sm font-medium">Modalidade</label>
      <Select onValueChange={onModalityChange}>
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
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
