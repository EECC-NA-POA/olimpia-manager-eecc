
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Athlete } from '../tabs/scores/hooks/useAthletes';

interface AthleteInfoProps {
  athlete: Athlete;
  athleteIdentifier: string;
  branchName?: string;
  branchState?: string;
  hasScoreForCurrentModality: boolean;
}

export function AthleteInfo({ 
  athlete, 
  athleteIdentifier, 
  branchName, 
  branchState, 
  hasScoreForCurrentModality 
}: AthleteInfoProps) {
  return (
    <>
      <div className="grid grid-cols-3 gap-1 text-xs">
        <div>
          <p className="text-gray-500">ID</p>
          <p>{athleteIdentifier}</p>
        </div>
        <div>
          <p className="text-gray-500">Filial</p>
          <p>{branchName || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500">Estado</p>
          <p>{branchState || 'N/A'}</p>
        </div>
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-1 text-xs">
        <div>
          <p className="text-gray-500">Documento</p>
          <p>{athlete.tipo_documento}</p>
        </div>
        <div>
          <p className="text-gray-500">Número</p>
          <p>{athlete.numero_documento}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-gray-500 text-xs mb-1">Status</p>
        <div className="flex gap-2">
          {hasScoreForCurrentModality ? (
            <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
              Avaliado
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
              Pendente
            </Badge>
          )}
        </div>
      </div>
    </>
  );
}
