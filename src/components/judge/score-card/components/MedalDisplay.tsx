
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';
import { ScoreRecord } from '../types';

interface MedalDisplayProps {
  scoreRecord: ScoreRecord | null;
  medalInfo: { posicao?: number; medalha?: string } | null;
  scoreType: 'tempo' | 'distancia' | 'pontos';
}

export function MedalDisplay({ scoreRecord, medalInfo, scoreType }: MedalDisplayProps) {
  // Display score value
  const getScoreDisplay = () => {
    if (!scoreRecord) return null;

    if (scoreType === 'tempo' && scoreRecord.tempo_minutos !== undefined) {
      const minutes = scoreRecord.tempo_minutos || 0;
      const seconds = scoreRecord.tempo_segundos || 0;
      const milliseconds = scoreRecord.tempo_milissegundos || 0;
      
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    } else if (scoreRecord.valor_pontuacao !== undefined) {
      const unit = scoreType === 'distancia' ? 'm' : 'pts';
      return `${scoreRecord.valor_pontuacao} ${unit}`;
    }
    
    return null;
  };

  // Display medal/position
  const getMedalDisplay = () => {
    if (!medalInfo) return null;

    const { posicao, medalha } = medalInfo;

    if (medalha) {
      const getMedalIcon = () => {
        switch (medalha) {
          case 'Ouro':
            return <Trophy className="w-4 h-4" />;
          case 'Prata':
            return <Medal className="w-4 h-4" />;
          case 'Bronze':
            return <Award className="w-4 h-4" />;
          default:
            return null;
        }
      };

      const getMedalColor = () => {
        switch (medalha) {
          case 'Ouro':
            return 'bg-yellow-500 text-yellow-50 border-yellow-600';
          case 'Prata':
            return 'bg-gray-400 text-gray-50 border-gray-500';
          case 'Bronze':
            return 'bg-amber-600 text-amber-50 border-amber-700';
          default:
            return 'bg-gray-100 text-gray-800 border-gray-300';
        }
      };

      return (
        <Badge className={`flex items-center gap-1 ${getMedalColor()}`}>
          {getMedalIcon()}
          {medalha}
        </Badge>
      );
    } else if (posicao) {
      return (
        <Badge variant="outline">
          {posicao}° lugar
        </Badge>
      );
    }

    return null;
  };

  const scoreDisplay = getScoreDisplay();
  const medalDisplay = getMedalDisplay();

  if (!scoreDisplay && !medalDisplay) {
    return null;
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {scoreDisplay && (
        <Badge variant="secondary" className="font-mono">
          {scoreDisplay}
        </Badge>
      )}
      {medalDisplay}
    </div>
  );
}
