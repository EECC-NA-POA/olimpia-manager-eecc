
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trophy } from 'lucide-react';
import { DynamicBateria } from '../hooks/useDynamicBaterias';

interface BateriaNavigationProps {
  baterias: DynamicBateria[];
  selectedBateriaId: number | null;
  onSelectBateria: (bateriaId: number) => void;
  onCreateBateria: () => void;
  onCreateFinalBateria: () => void;
  isCreating: boolean;
  isLoading: boolean;
}

export function BateriaNavigation({
  baterias,
  selectedBateriaId,
  onSelectBateria,
  onCreateBateria,
  onCreateFinalBateria,
  isCreating,
  isLoading
}: BateriaNavigationProps) {
  const regularBaterias = baterias.filter(b => !b.isFinal);
  const finalBateria = baterias.find(b => b.isFinal);

  const getBateriaDisplayName = (numero: number) => {
    return numero === 999 ? 'Final' : numero.toString();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Baterias:</span>
        
        {/* Regular baterias */}
        {regularBaterias.map((bateria) => (
          <Button
            key={bateria.numero}
            variant={selectedBateriaId === bateria.numero ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectBateria(bateria.numero)}
            className="h-8"
          >
            Bateria {bateria.numero}
            <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
              {bateria.atletasCount || 0}
            </Badge>
          </Button>
        ))}

        {/* Final bateria */}
        {finalBateria && (
          <Button
            variant={selectedBateriaId === finalBateria.numero ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectBateria(finalBateria.numero)}
            className="h-8 bg-yellow-100 hover:bg-yellow-200 border-yellow-300"
          >
            <Trophy className="h-3 w-3 mr-1" />
            Final
            <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
              {finalBateria.atletasCount || 0}
            </Badge>
          </Button>
        )}

        {/* Create new bateria button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateBateria}
          disabled={isCreating || isLoading}
          className="h-8"
        >
          <Plus className="h-3 w-3 mr-1" />
          Nova Bateria
        </Button>

        {/* Create final bateria button - only show if no final exists */}
        {!finalBateria && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateFinalBateria}
            disabled={isCreating || isLoading}
            className="h-8 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
          >
            <Trophy className="h-3 w-3 mr-1" />
            Criar Final
          </Button>
        )}
      </div>

      {selectedBateriaId && (
        <div className="text-xs text-muted-foreground">
          Bateria selecionada: {getBateriaDisplayName(selectedBateriaId)}
        </div>
      )}
    </div>
  );
}
