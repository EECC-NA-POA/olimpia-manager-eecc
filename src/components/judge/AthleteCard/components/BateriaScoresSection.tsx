
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface BateriaScore {
  id: number;
  bateria_id: number;
  valor_pontuacao?: number;
}

interface Bateria {
  id: number;
  numero: number;
}

interface BateriaScoresSectionProps {
  bateriasData: Bateria[];
  batteriaScores: BateriaScore[];
  scoreType: 'tempo' | 'distancia' | 'pontos';
  onScoreUpdate: (scoreId: number, value: string) => void;
}

export function BateriaScoresSection({ 
  bateriasData, 
  batteriaScores, 
  scoreType, 
  onScoreUpdate 
}: BateriaScoresSectionProps) {
  if (bateriasData.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
      <h4 className="text-sm font-medium text-blue-800 mb-2">Pontuações por Bateria</h4>
      <div className="space-y-2">
        {bateriasData.map((bateria) => {
          const score = batteriaScores.find(s => s.bateria_id === bateria.id);
          
          return (
            <div key={bateria.id} className="flex items-center justify-between bg-white rounded p-2 border">
              <span className="text-sm font-medium text-gray-700">Bateria {bateria.numero}</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step={scoreType === 'distancia' ? '0.01' : '1'}
                  placeholder={scoreType === 'distancia' ? '0.00' : '0'}
                  value={score?.valor_pontuacao?.toString() || ''}
                  onChange={(e) => {
                    if (score) {
                      onScoreUpdate(score.id, e.target.value);
                    }
                  }}
                  className="w-20 h-8 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-xs text-gray-500 min-w-[30px]">
                  {scoreType === 'distancia' ? 'm' : scoreType === 'tempo' ? 'ms' : 'pts'}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Focus on the input for editing
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
