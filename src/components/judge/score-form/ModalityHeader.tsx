
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modality } from '@/lib/types/database';

interface ModalityHeaderProps {
  modality: Modality;
  isTeamModality: boolean;
  scoreType: string;
}

export function ModalityHeader({ modality, isTeamModality, scoreType }: ModalityHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Registrar {isTeamModality ? 'Pontuação da Equipe' : 'Pontuação'}</CardTitle>
          <CardDescription>
            Modalidade: {modality.modalidade_nome}
            {isTeamModality && (
              <span className="ml-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Coletiva
                </Badge>
              </span>
            )}
          </CardDescription>
        </div>
        <div>
          <Badge 
            variant="secondary"
            className="ml-2 capitalize"
          >
            {scoreType === 'tempo' && 'Tempo'}
            {scoreType === 'distancia' && 'Distância'}
            {scoreType === 'pontos' && 'Pontos'}
          </Badge>
        </div>
      </div>
    </CardHeader>
  );
}
