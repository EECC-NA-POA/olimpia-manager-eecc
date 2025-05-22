
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScoreRecord } from '../types';

interface MedalDisplayProps {
  scoreRecord: ScoreRecord | null;
  scoreType: 'time' | 'distance' | 'points';
}

export function MedalDisplay({ scoreRecord, scoreType }: MedalDisplayProps) {
  if (!scoreRecord || !scoreRecord.medalha) {
    return null;
  }

  const medalBadge = (
    <Badge 
      className={`
        ${scoreRecord.medalha === 'ouro' ? 'bg-yellow-400 text-yellow-900' : ''}
        ${scoreRecord.medalha === 'prata' ? 'bg-gray-300 text-gray-700' : ''}
        ${scoreRecord.medalha === 'bronze' ? 'bg-amber-600 text-amber-950' : ''}
        ${scoreRecord.medalha === 'participacao' ? 'bg-blue-200 text-blue-800' : ''}
      `}
    >
      {scoreRecord.medalha === 'ouro' ? '1º Lugar' : ''}
      {scoreRecord.medalha === 'prata' ? '2º Lugar' : ''}
      {scoreRecord.medalha === 'bronze' ? '3º Lugar' : ''}
      {scoreRecord.medalha === 'participacao' ? 'Participação' : ''}
    </Badge>
  );

  const scoreBadge = scoreRecord && (
    <Badge variant="outline" className="bg-green-50">
      {scoreType === 'time' ? 
        `${scoreRecord.tempo_minutos || 0}m ${scoreRecord.tempo_segundos || 0}s ${scoreRecord.tempo_milissegundos || 0}ms` : 
        `${scoreRecord.valor_pontuacao || 0} ${scoreType === 'distance' ? 'm' : 'pontos'}`
      }
    </Badge>
  );

  return (
    <div className="flex items-center space-x-2">
      {medalBadge}
      {scoreBadge}
    </div>
  );
}
