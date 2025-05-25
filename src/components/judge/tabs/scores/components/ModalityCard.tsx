
import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { ModalityButtons } from './ModalityButtons';
import { Modality } from '@/lib/types/database';

interface ModalityCardProps {
  modalities: Modality[] | undefined;
  onSelectModality: (id: number) => void;
  selectedModalityId: number | null;
}

export function ModalityCard({ modalities, onSelectModality, selectedModalityId }: ModalityCardProps) {
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
          <ModalityButtons 
            modalities={modalities || []}
            onSelectModality={onSelectModality}
            selectedModalityId={selectedModalityId}
          />
        </div>
      </CardContent>
    </Card>
  );
}
