import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModalityOption } from '../types';

interface ModalitySelectProps {
  modalities: ModalityOption[];
  value: number | null;
  onValueChange: (value: number) => void;
}

export function ModalitySelect({ modalities, value, onValueChange }: ModalitySelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Modalidade</label>
      <Select 
        value={value?.toString() || ''} 
        onValueChange={(val) => onValueChange(Number(val))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma modalidade coletiva" />
        </SelectTrigger>
        <SelectContent>
          {modalities.map((modality) => (
            <SelectItem key={modality.id} value={modality.id.toString()}>
              {modality.nome} - {modality.categoria}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
