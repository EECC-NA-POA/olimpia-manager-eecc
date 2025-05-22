
import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { ModalitySelector } from './ModalitySelector';
import { Modality } from '@/lib/types/database';

interface ModalityCardProps {
  modalities: Modality[] | undefined;
  onSelectModality: (id: number) => void;
}

export function ModalityCard({ modalities, onSelectModality }: ModalityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Pontuações Individuais</CardTitle>
        <CardDescription>
          Selecione uma modalidade para visualizar os atletas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ModalitySelector 
            modalities={modalities}
            onSelectModality={onSelectModality}
          />
        </div>
      </CardContent>
    </Card>
  );
}
